"""FastAPI application for Jaanch ML inference service."""

import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import (
    HealthResponse,
    MLSignalRequest,
    MLSignalResponse,
    URLSignalRequest,
    URLSignalResponse,
    ErrorResponse
)
from app.model_service import model_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("jaanch_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the calibrated model artifacts once at application startup."""
    logger.info("Initializing Jaanch ML Inference Service...")
    loaded = model_service.load_model()
    if not loaded:
        logger.warning(
            "One or more model artifacts could not be loaded at startup."
        )
    yield
    logger.info("Shutting down Jaanch ML Inference Service.")


app = FastAPI(
    title="Jaanch ML Scam & Phishing Detection Service",
    version="2.1.0",
    description="Explainable, calibrated ML supplementary triage service for text scam and URL phishing detection.",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def verify_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Validates API key:
    - Required in production or whenever API_KEY is set.
    - Optional in local development if API_KEY is blank.
    """
    configured_key = settings.API_KEY

    if configured_key or settings.ENVIRONMENT == "production":
        provided_key = None
        if x_api_key:
            provided_key = x_api_key
        elif authorization:
            if authorization.startswith("Bearer "):
                provided_key = authorization[7:].strip()
            else:
                provided_key = authorization.strip()

        if not provided_key or provided_key != configured_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Missing or invalid API key.",
            )


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check and model load status",
)
async def health_check():
    """Returns the service health and model status."""
    return HealthResponse(
        status="ok",
        model_loaded=model_service.is_loaded,
        model_version=settings.MODEL_VERSION,
        url_model_loaded=model_service.is_url_model_loaded,
    )


@app.post(
    "/ml/signal",
    response_model=MLSignalResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Consent missing"},
        500: {"model": ErrorResponse, "description": "Inference Error"},
        503: {"model": ErrorResponse, "description": "Model Not Ready"},
    },
    tags=["Inference"],
    summary="Generate supplementary ML scam detection signal",
)
async def generate_ml_signal(
    request: MLSignalRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Evaluates job posting text under conservative safety guardrails:
    1. Rejects with 403 if consent is False.
    2. Redacts PII before tokenization.
    3. Returns calibrated probability, severity capped at Medium, and top contributing terms.
    """
    verify_api_key(x_api_key=x_api_key, authorization=authorization)

    if not request.consent:
        logger.info("Request rejected: User consent not granted.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Explicit user consent is required before analyzing message text.",
        )

    if not model_service.is_loaded:
        logger.error("Inference requested while text model is not loaded.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service Unavailable: Text model artifact is not ready.",
        )

    try:
        result = model_service.predict(request.text)
        return MLSignalResponse(**result)
    except Exception as e:
        logger.error(f"Inference error encountered: {type(e).__name__}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InferenceError",
                "message": "Unable to compute ML signal safely. Please rely on deterministic rule checks."
            }
        )


@app.post(
    "/ml/url-signal",
    response_model=URLSignalResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Inference Error"},
        503: {"model": ErrorResponse, "description": "Model Not Ready"},
    },
    tags=["Inference"],
    summary="Evaluate URL for phishing indicators with calibrated ML model",
)
async def generate_url_signal(
    request: URLSignalRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Evaluates a raw URL for phishing risk:
    1. Extracts 18 lexical and structural features.
    2. Computes calibrated probability using trained model.
    3. Categorizes risk (< 0.35 safe, 0.35 - 0.70 suspicious, >= 0.70 danger).
    4. Explains trigger factors (e.g. IP usage, brand spoofing, excessive hyphens, entropy).
    """
    verify_api_key(x_api_key=x_api_key, authorization=authorization)

    if not model_service.is_url_model_loaded:
        logger.error("URL inference requested while URL model is not loaded.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service Unavailable: URL phishing model artifact is not ready.",
        )

    try:
        result = model_service.predict_url(request.url)
        return URLSignalResponse(**result)
    except Exception as e:
        logger.error(f"URL inference error encountered: {type(e).__name__} - {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "URLInferenceError",
                "message": "Unable to compute URL phishing signal safely."
            }
        )

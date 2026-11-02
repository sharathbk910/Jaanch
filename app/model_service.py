"""In-memory model service for deterministic, explainable scam and phishing detection."""

import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

from app.config import settings
from app.redaction import redact_text
from app.policy import evaluate_severity, get_policy_metadata
from app.url_feature_extractor import extract_url_features

logger = logging.getLogger("jaanch_model_service")


def derive_url_trigger_factors(features: Dict[str, Any]) -> List[str]:
    """Generates human-readable explainable trigger factors for URL phishing risk."""
    factors: List[str] = []
    if features.get("has_ip", 0) == 1:
        factors.append("Direct IP address used instead of authentic domain name")
    if features.get("subdomain_brand", 0) > 0:
        factors.append("Target organization or brand keywords detected inside subdomain (brand spoofing)")
    if features.get("root_hyphens", 0) >= 2 or features.get("subdomain_hyphens", 0) >= 2:
        factors.append("Excessive hyphens in hostname indicative of deceptive registration")
    if features.get("suspicious_words", 0) > 0:
        count = features.get("suspicious_words")
        factors.append(f"Contains {count} high-risk credential-harvesting keyword(s)")
    if features.get("entropy", 0.0) >= 4.2:
        factors.append(f"High string randomness/entropy ({features.get('entropy')}) typical of algorithmic phishing links")
    if features.get("subdomain_dots", 0) >= 3 or features.get("subdomain_len", 0) > 30:
        factors.append("Deeply nested subdomains obscuring true host identity")
    if features.get("has_https", 1) == 0:
        factors.append("Insecure plain HTTP protocol without SSL/TLS encryption")
    return factors


class ModelService:
    """Singleton service to load models once at startup and execute inference."""

    def __init__(self):
        # Text scam model
        self.model: Optional[Any] = None
        self.is_loaded: bool = False
        self.tfidf = None
        self.clf = None

        # URL phishing model
        self.url_model: Optional[Any] = None
        self.is_url_model_loaded: bool = False

    def load_model(self) -> bool:
        """Loads both calibrated joblib pipelines once at startup."""
        text_loaded = self.load_text_model()
        url_loaded = self.load_url_model()
        return text_loaded or url_loaded

    def load_text_model(self) -> bool:
        """Loads the text scam detection model."""
        model_path = settings.MODEL_PATH
        if not model_path.exists():
            logger.error(f"Text model artifact not found at {model_path}")
            self.is_loaded = False
            return False

        try:
            logger.info(f"Loading calibrated text model from {model_path}...")
            self.model = joblib.load(model_path)
            self._extract_feature_components()
            self.is_loaded = True
            logger.info(f"Text model successfully loaded. Version: {settings.MODEL_VERSION}")
            return True
        except Exception as e:
            logger.error(f"Failed to load text model artifact: {e}")
            self.is_loaded = False
            return False

    def load_url_model(self) -> bool:
        """Loads the phishing URL detection model."""
        url_model_path = settings.URL_MODEL_PATH
        if not url_model_path.exists():
            logger.error(f"URL model artifact not found at {url_model_path}")
            self.is_url_model_loaded = False
            return False

        try:
            logger.info(f"Loading calibrated URL phishing model from {url_model_path}...")
            self.url_model = joblib.load(url_model_path)
            self.is_url_model_loaded = True
            logger.info(f"URL phishing model successfully loaded. Version: {settings.URL_MODEL_VERSION}")
            return True
        except Exception as e:
            logger.error(f"Failed to load URL model artifact: {e}")
            self.is_url_model_loaded = False
            return False

    def _extract_feature_components(self):
        """Extracts vectorizer/feature-union and base classifier coefficients for token explanations."""
        if self.model is None:
            return

        base_pipeline = None
        if hasattr(self.model, "estimator"):
            base_pipeline = self.model.estimator
        elif hasattr(self.model, "calibrated_classifiers_") and len(self.model.calibrated_classifiers_) > 0:
            base_pipeline = self.model.calibrated_classifiers_[0].estimator
        else:
            base_pipeline = self.model

        if hasattr(base_pipeline, "named_steps"):
            self.tfidf = base_pipeline.named_steps.get("features") or base_pipeline.named_steps.get("tfidf")
            self.clf = base_pipeline.named_steps.get("clf")

    def explain_terms(self, text: str, top_k: int = 5) -> List[str]:
        """Extracts top n-gram tokens contributing most to the positive (scam) class."""
        if not self.tfidf or not self.clf:
            return []

        try:
            feature_names = self.tfidf.get_feature_names_out()
            x_vec = self.tfidf.transform([text])
            coefs = self.clf.coef_[0]

            nz_indices = x_vec.nonzero()[1]
            if len(nz_indices) == 0:
                return []

            contributions = []
            for idx in nz_indices:
                val = x_vec[0, idx]
                weight = coefs[idx]
                score = val * weight
                if score > 0:
                    term = feature_names[idx]
                    contributions.append((term, score))

            contributions.sort(key=lambda item: item[1], reverse=True)
            top_terms = [t[0] for t in contributions[:top_k]]

            clean_terms = []
            for t in top_terms:
                if "__" in t:
                    t = t.split("__")[-1]
                clean_terms.append(t)

            return clean_terms
        except Exception as e:
            logger.warning(f"Could not extract feature explanations: {e}")
            return []

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """Executes complete text inference workflow."""
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Text model is not initialized or failed to load.")

        redacted = redact_text(raw_text)

        try:
            probs = self.model.predict_proba([redacted])[0]
            scam_prob = float(round(probs[1], 4))
        except Exception as e:
            logger.error("Inference execution failed during predict_proba.")
            raise RuntimeError("Inference execution failed safely.") from e

        severity = evaluate_severity(scam_prob)
        policy_meta = get_policy_metadata()

        if severity == "none":
            signal = None
            terms: List[str] = []
        else:
            signal = "possible_scam_pattern"
            terms = self.explain_terms(redacted, top_k=5)

        return {
            "source": "ml",
            "signal": signal,
            "severity": severity,
            "confidence": scam_prob,
            "model_version": settings.MODEL_VERSION,
            "top_contributing_terms": terms,
            "policy": policy_meta
        }

    def predict_url(self, raw_url: str) -> Dict[str, Any]:
        """
        Executes URL phishing inference workflow:
        1. Feature extraction across 18 lexical/structural dimensions
        2. Calibrated probability scoring
        3. Threshold policy (< 0.35 safe, 0.35 - 0.70 suspicious, >= 0.70 danger)
        4. Explainable trigger factor derivation
        """
        if not self.is_url_model_loaded or self.url_model is None:
            raise RuntimeError("URL phishing detection model is not initialized or failed to load.")

        features = extract_url_features(raw_url)
        df = pd.DataFrame([features])

        # Stage 1: Deterministic Rule Pre-Filtering (Priority 1 - Strict Override)
        # Rule R-03: Verified Employer / Government Domain
        OFFICIAL_ROOTS = (
            "gov.in", "nic.in", "aicte-india.org", "ncs.gov.in", "mca.gov.in",
            "google.com", "infosys.com", "tcs.com", "wipro.com", "microsoft.com", "amazon.com"
        )
        hostname = ""
        try:
            from urllib.parse import urlparse
            p = urlparse(raw_url if "://" in raw_url else f"http://{raw_url}")
            hostname = (p.hostname or "").lower()
        except Exception:
            pass

        is_verified_root = any(hostname == r or hostname.endswith("." + r) for r in OFFICIAL_ROOTS)
        if is_verified_root and not features.get("has_ip") and not features.get("subdomain_brand"):
            return {
                "url": raw_url,
                "risk_score": 0.0,
                "risk_level": "safe",
                "is_phishing": False,
                "trigger_factors": [],
                "features": features,
            }

        try:
            probs = self.url_model.predict_proba(df)[0]
            phishing_prob = float(round(probs[1], 4))
        except Exception as e:
            logger.error("URL inference execution failed during predict_proba.")
            raise RuntimeError("URL inference execution failed safely.") from e

        # Apply threshold policy: < 0.35 -> safe, 0.35 - 0.70 -> suspicious, >= 0.70 -> danger
        if phishing_prob >= 0.70:
            risk_level = "danger"
            is_phishing = True
        elif phishing_prob >= 0.35:
            risk_level = "suspicious"
            is_phishing = False
        else:
            risk_level = "safe"
            is_phishing = False

        trigger_factors = derive_url_trigger_factors(features)

        return {
            "url": raw_url,
            "risk_score": phishing_prob,
            "risk_level": risk_level,
            "is_phishing": is_phishing,
            "trigger_factors": trigger_factors,
            "features": features,
        }


# Global instance
model_service = ModelService()

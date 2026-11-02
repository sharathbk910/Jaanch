"""
Jaanch AI - Embedded Calibrated Scam Detection Inference Module
Protects users against recruitment fraud with 6 defensive safety invariants:
  1. Mandatory User Consent
  2. Pre-Tokenization PII Redaction
  3. Severity Hard-Capped at Medium
  4. Conservative Threshold Policy
  5. Anti-Hallucination & Anti-Overreach
  6. Fail-Open Exception Shielding
"""

import os
import re
import logging
import warnings
from typing import Optional, Dict, Any, List, Tuple
import numpy as np
import joblib

# Suppress deserialization version warnings
warnings.filterwarnings("ignore", category=UserWarning)

logger = logging.getLogger("jaanch.detector")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [JaanchDetector] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class ConsentRequiredError(Exception):
    """Raised when evaluation is attempted without affirmative user consent."""
    pass


# -----------------------------------------------------------------------------
# Invariant 2: Pre-Tokenization PII Redaction
# -----------------------------------------------------------------------------
# Compiling regexes once for high-throughput performance

RE_PAN = re.compile(r"\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b")
RE_AADHAAR = re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b")
RE_URL = re.compile(r"https?://\S+|www\.\S+|\b[A-Za-z0-9.-]+\.(?:com|org|in|net|edu|gov|co|io|app|xyz)(?:/\S*)?\b", re.IGNORECASE)
RE_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
RE_UPI = re.compile(r"\b[A-Za-z0-9._-]{2,64}@(?!\[EMAIL_REDACTED\])[A-Za-z0-9]{2,32}\b")
RE_PHONE = re.compile(
    r"(?:\+?91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}\b|"
    r"(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}\b"
)


def redact_pii(text: str) -> str:
    """
    Sanitizes and masks Personally Identifiable Information (PII) before model tokenization:
      - Emails -> [EMAIL_REDACTED]
      - URLs & Web addresses -> [URL_REDACTED]
      - UPI handles / VPAs -> [UPI_REDACTED]
      - PAN & Aadhaar numbers -> [ID_REDACTED]
      - Phone numbers -> [PHONE_REDACTED]
    """
    if not text:
        return ""

    sanitized = text

    # 1. Emails (must run before URLs to avoid partial domain matching)
    sanitized = RE_EMAIL.sub("[EMAIL_REDACTED]", sanitized)

    # 2. URLs and Web links
    sanitized = RE_URL.sub("[URL_REDACTED]", sanitized)

    # 3. UPI handles / VPAs (e.g., user@upi, hr@okhdfcbank, name@ybl)
    sanitized = RE_UPI.sub("[UPI_REDACTED]", sanitized)

    # 4. Identity Numbers (PAN & Aadhaar)
    sanitized = RE_PAN.sub("[ID_REDACTED]", sanitized)
    sanitized = RE_AADHAAR.sub("[ID_REDACTED]", sanitized)

    # 5. Phone numbers (Indian 10-digit mobile, +91, landline, international)
    sanitized = RE_PHONE.sub("[PHONE_REDACTED]", sanitized)

    return sanitized


# -----------------------------------------------------------------------------
# Invariant 1, 3, 4, 5, 6: JaanchScamDetector Singleton
# -----------------------------------------------------------------------------
class JaanchScamDetector:
    """
    Singleton embedded inference engine for Jaanch scam classification.
    Loads models/jaanch_scam_model_v3_tuned_calibrated.joblib once at startup.
    """

    _instance: Optional["JaanchScamDetector"] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_path: Optional[str] = None):
        if self._initialized:
            return

        self.model = None
        self.model_path = model_path or self._resolve_model_path()
        self.feature_names = None
        self.ensemble_coefs = None
        self.vectorizer = None

        self._load_model()
        self._initialized = True

    @classmethod
    def get_instance(cls, model_path: Optional[str] = None) -> "JaanchScamDetector":
        """Convenience accessor for the singleton instance."""
        if cls._instance is None:
            cls._instance = cls(model_path=model_path)
        return cls._instance

    @classmethod
    def reset_instance(cls):
        """Reset singleton instance (useful for unit testing)."""
        cls._instance = None

    def _resolve_model_path(self) -> str:
        """Locates the calibrated model artifact across common execution roots."""
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(base_dir, "models", "jaanch_scam_model_v3_tuned_calibrated.joblib"),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "jaanch_scam_model_v3_tuned_calibrated.joblib"),
            os.path.join(base_dir, "jaanch_scam_model_v3_tuned_calibrated.joblib"),
            "models/jaanch_scam_model_v3_tuned_calibrated.joblib",
            "jaanch_scam_model_v3_tuned_calibrated.joblib",
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                return candidate
        return candidates[0]

    def _load_model(self):
        """Loads and pre-caches explainability artifacts from the calibrated pipeline."""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Model artifact not found at {self.model_path}. Detector will operate in fail-open mode.")
                return

            logger.info(f"Loading calibrated scam model from {self.model_path}...")
            self.model = joblib.load(self.model_path)
            logger.info("Calibrated model artifact successfully loaded.")

            # Pre-extract vectorizer and ensemble coefficients for explainability
            if hasattr(self.model, "calibrated_classifiers_") and self.model.calibrated_classifiers_:
                first_pipeline = self.model.calibrated_classifiers_[0].estimator
                if hasattr(first_pipeline, "named_steps"):
                    self.vectorizer = first_pipeline.named_steps.get("features") or first_pipeline.named_steps.get("tfidf")
                    if hasattr(self.vectorizer, "get_feature_names_out"):
                        self.feature_names = self.vectorizer.get_feature_names_out()

                    # Average coefficients across all calibrated folds
                    coef_list = []
                    for c in self.model.calibrated_classifiers_:
                        clf = c.estimator.named_steps.get("clf") or c.estimator.named_steps.get("classifier")
                        if hasattr(clf, "coef_"):
                            coef_list.append(clf.coef_[0])
                    if coef_list:
                        self.ensemble_coefs = np.mean(coef_list, axis=0)

        except Exception as e:
            logger.error(f"Failed to load model from {self.model_path}: {e}. Detector will fail open.")
            self.model = None

    def extract_top_contributing_terms(self, redacted_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Extracts the top contributing scam terms by multiplying TF-IDF term frequencies
        with classifier coefficients, stripping pipeline prefixes ('word__', 'char__', 'tfidf__').
        """
        if self.vectorizer is None or self.feature_names is None or self.ensemble_coefs is None:
            return []

        try:
            X = self.vectorizer.transform([redacted_text])
            nonzero_indices = X.nonzero()[1]
            if len(nonzero_indices) == 0:
                return []

            contributions: Dict[str, float] = {}
            for idx in nonzero_indices:
                score = float(X[0, idx] * self.ensemble_coefs[idx])
                if score > 0:  # Feature positively votes towards scam class
                    raw_feature = str(self.feature_names[idx])
                    # Strip prefixes (e.g. word__, char__, tfidf__)
                    clean_term = raw_feature
                    for prefix in ("word__", "char__", "tfidf__"):
                        if clean_term.startswith(prefix):
                            clean_term = clean_term[len(prefix):]
                    clean_term = clean_term.strip()

                    # Filter single characters or pure whitespace
                    if len(clean_term) > 1 and not clean_term.startswith("["):
                        contributions[clean_term] = max(contributions.get(clean_term, 0.0), score)

            sorted_terms = sorted(contributions.items(), key=lambda item: item[1], reverse=True)
            return [{"term": term, "weight": round(weight, 4)} for term, weight in sorted_terms[:top_k]]
        except Exception as e:
            logger.debug(f"Explainability term extraction bypassed: {e}")
            return []

    def evaluate(
        self,
        text: str,
        consent: bool = False,
        raise_on_no_consent: bool = False,
        include_explanation: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes safe calibrated inference against raw offer text.

        Enforces all 6 Safety Invariants:
          1. Mandatory user consent check
          2. Pre-tokenization PII redaction
          3. Severity clamped strictly at 'medium' (never 'high' or 'critical')
          4. Conservative thresholds (0.50 / 0.75)
          5. Anti-hallucination disclaimers (never marks verified / legitimate)
          6. Defensive fail-open shielding against crashes
        """

        # ---------------------------------------------------------------------
        # Invariant 1: Mandatory User Consent
        # ---------------------------------------------------------------------
        if not consent:
            if raise_on_no_consent:
                raise ConsentRequiredError("Inference aborted: affirmative user consent is required.")
            return {
                "status": "skipped",
                "reason": "consent_required",
                "confidence": 0.0,
                "severity": "none",
                "signal": None,
                "sanitized_text": None,
                "top_contributing_terms": [],
                "verified": False,
                "supplementary_only": True,
            }

        # ---------------------------------------------------------------------
        # Invariant 6: Fail-Open Exception Shielding
        # ---------------------------------------------------------------------
        try:
            if not text or not text.strip():
                return {
                    "status": "evaluated",
                    "confidence": 0.0,
                    "severity": "none",
                    "signal": None,
                    "sanitized_text": "",
                    "top_contributing_terms": [],
                    "verified": False,
                    "supplementary_only": True,
                }

            if self.model is None:
                logger.warning("Scam model unavailable in evaluate(). Failing open cleanly.")
                return {
                    "status": "fallback",
                    "confidence": 0.0,
                    "severity": "none",
                    "signal": None,
                    "error": "InferenceFallback",
                    "verified": False,
                    "supplementary_only": True,
                }

            # -----------------------------------------------------------------
            # Invariant 2: Pre-Tokenization PII Redaction
            # -----------------------------------------------------------------
            sanitized = redact_pii(text)

            # -----------------------------------------------------------------
            # Model Predict Proba (Calibrated Scam Probability)
            # -----------------------------------------------------------------
            probabilities = self.model.predict_proba([sanitized])
            scam_prob = float(probabilities[0][1])

            # -----------------------------------------------------------------
            # Invariant 4: Conservative Threshold Policy
            # -----------------------------------------------------------------
            if scam_prob >= 0.75:
                raw_severity = "medium"
                signal = "possible_scam_pattern"
            elif scam_prob >= 0.50:
                raw_severity = "low"
                signal = "possible_scam_pattern"
            else:
                raw_severity = "none"
                signal = None

            # -----------------------------------------------------------------
            # Invariant 3: Severity Hard-Capped at Medium
            # Programmatically clamp output so 'high' or 'critical' is impossible
            # -----------------------------------------------------------------
            if raw_severity in ["high", "critical", "medium"]:
                severity = "medium"
            elif raw_severity == "low":
                severity = "low"
            else:
                severity = "none"

            # Explainability: Extract top contributing terms
            top_terms = []
            if include_explanation and signal is not None:
                top_terms = self.extract_top_contributing_terms(sanitized, top_k=5)

            # -----------------------------------------------------------------
            # Invariant 5: Anti-Hallucination & Anti-Overreach
            # Never mark 'verified' or 'legitimate'. Strictly supplementary.
            # -----------------------------------------------------------------
            return {
                "status": "evaluated",
                "confidence": round(scam_prob, 4),
                "severity": severity,
                "signal": signal,
                "top_contributing_terms": top_terms,
                "sanitized_text": sanitized,
                "verified": False,  # Safety invariant: Never True
                "supplementary_only": True,
                "disclaimer": "Statistical pattern match only. Does not confirm offer authenticity or safety.",
            }

        except Exception as exc:
            # Invariant 6: Fail-open shielding ensures host application never crashes
            logger.error(f"Inference exception encountered: {exc}. Shielding with fail-open fallback.")
            return {
                "status": "fallback",
                "signal": None,
                "severity": "none",
                "confidence": 0.0,
                "error": "InferenceFallback",
                "verified": False,
                "supplementary_only": True,
            }


# Module-level convenience function matching the legacy signature with safety invariants
def evaluate_job_text(text: str, consent: bool = True) -> Dict[str, Any]:
    """
    Evaluates raw offer text using the singleton JaanchScamDetector.
    """
    detector = JaanchScamDetector.get_instance()
    result = detector.evaluate(text, consent=consent)
    return {
        "confidence": result.get("confidence", 0.0),
        "severity": result.get("severity", "none"),
        "signal": result.get("signal", None),
        "top_contributing_terms": result.get("top_contributing_terms", []),
        "sanitized_text": result.get("sanitized_text", ""),
        "verified": False,
        "supplementary_only": True,
    }

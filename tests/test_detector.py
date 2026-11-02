"""
Unit Tests for JaanchScamDetector
Validates all 6 Safety Invariants & Architectural Requirements:
  1. Mandatory User Consent
  2. Pre-Tokenization PII Redaction
  3. Severity Hard-Capped at Medium
  4. Conservative Threshold Policy
  5. Anti-Hallucination & Anti-Overreach
  6. Fail-Open Exception Shielding
  7. Explainability Prefix Stripping
  8. Singleton Pattern
"""

import unittest
from unittest.mock import MagicMock
import os
import sys

# Ensure models package is on path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from models.detector import (
    JaanchScamDetector,
    ConsentRequiredError,
    redact_pii,
)


class TestJaanchScamDetectorSafetyInvariants(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize singleton
        cls.detector = JaanchScamDetector.get_instance()

    # -------------------------------------------------------------------------
    # 1. Mandatory User Consent
    # -------------------------------------------------------------------------
    def test_consent_refusal_returns_no_signal(self):
        """Verifies that without consent, inference is aborted and no signal is returned."""
        scam_text = "Urgent: Selected for Google Intern. Pay 5000 rs registration fee via UPI."

        # Default consent=False
        result = self.detector.evaluate(scam_text, consent=False)
        self.assertEqual(result["status"], "skipped")
        self.assertEqual(result["reason"], "consent_required")
        self.assertIsNone(result["signal"])
        self.assertEqual(result["confidence"], 0.0)
        self.assertEqual(result["severity"], "none")
        self.assertFalse(result["verified"])

        # With raise_on_no_consent=True
        with self.assertRaises(ConsentRequiredError):
            self.detector.evaluate(scam_text, consent=False, raise_on_no_consent=True)

    # -------------------------------------------------------------------------
    # 2. Pre-Tokenization PII Redaction
    # -------------------------------------------------------------------------
    def test_pii_masked_before_model_input(self):
        """Verifies that all emails, phones, URLs, UPI handles, PAN, and Aadhaar are masked."""
        raw_text = (
            "Contact HR Priya at priya.recruiter@scamcorp.in or +91 98765 43210. "
            "Send Rs 4500 to hrteam@okhdfcbank or scammer@upi. "
            "Visit https://careers-fraud.org/verify. "
            "Submit PAN ABCDE1234F and Aadhaar 2345 6789 0123."
        )

        sanitized = redact_pii(raw_text)

        # Assert no raw PII remains
        self.assertNotIn("priya.recruiter@scamcorp.in", sanitized)
        self.assertNotIn("98765 43210", sanitized)
        self.assertNotIn("hrteam@okhdfcbank", sanitized)
        self.assertNotIn("scammer@upi", sanitized)
        self.assertNotIn("https://careers-fraud.org/verify", sanitized)
        self.assertNotIn("ABCDE1234F", sanitized)
        self.assertNotIn("2345 6789 0123", sanitized)

        # Assert correct redaction tokens are inserted
        self.assertIn("[EMAIL_REDACTED]", sanitized)
        self.assertIn("[PHONE_REDACTED]", sanitized)
        self.assertIn("[UPI_REDACTED]", sanitized)
        self.assertIn("[URL_REDACTED]", sanitized)
        self.assertIn("[ID_REDACTED]", sanitized)

        # Verify detector evaluate output exposes sanitized_text
        eval_result = self.detector.evaluate(raw_text, consent=True)
        self.assertNotIn("priya.recruiter@scamcorp.in", eval_result["sanitized_text"])
        self.assertNotIn("ABCDE1234F", eval_result["sanitized_text"])
        self.assertIn("[ID_REDACTED]", eval_result["sanitized_text"])

    # -------------------------------------------------------------------------
    # 3. Severity Hard-Capped at Medium
    # -------------------------------------------------------------------------
    def test_probabilities_clamped_to_severity_medium_never_high(self):
        """Verifies that high scam probabilities are clamped strictly to 'medium'."""
        blatant_scam = (
            "Congratulations! Selected for Data Entry Operator. "
            "Send 5000 rs registration deposit immediately via Google Pay to receive appointment letter."
        )

        result = self.detector.evaluate(blatant_scam, consent=True)
        self.assertGreaterEqual(result["confidence"], 0.75)
        self.assertEqual(result["severity"], "medium")
        self.assertNotEqual(result["severity"], "high")
        self.assertNotEqual(result["severity"], "critical")
        self.assertIn(result["severity"], ["none", "low", "medium"])

    def test_mocked_probability_99_percent_clamped_to_medium(self):
        """Verifies that even a mocked probability of 0.9999 is clamped to medium."""
        original_model = self.detector.model
        try:
            # Mock model returning 0.9999 probability for class 1
            mock_model = MagicMock()
            mock_model.predict_proba.return_value = [[0.0001, 0.9999]]
            self.detector.model = mock_model

            result = self.detector.evaluate("Any text here", consent=True)
            self.assertEqual(result["confidence"], 0.9999)
            self.assertEqual(result["severity"], "medium")
            self.assertEqual(result["signal"], "possible_scam_pattern")
            self.assertFalse(result["verified"])
        finally:
            self.detector.model = original_model

    # -------------------------------------------------------------------------
    # 4. Conservative Threshold Policy
    # -------------------------------------------------------------------------
    def test_conservative_threshold_boundaries(self):
        """Verifies the exact threshold tier boundaries: <0.50 (none), 0.50-0.75 (low), >=0.75 (medium)."""
        original_model = self.detector.model
        try:
            mock_model = MagicMock()
            self.detector.model = mock_model

            # Case A: p = 0.49 -> none
            mock_model.predict_proba.return_value = [[0.51, 0.49]]
            res_a = self.detector.evaluate("Test text", consent=True)
            self.assertEqual(res_a["severity"], "none")
            self.assertIsNone(res_a["signal"])

            # Case B: p = 0.50 -> low
            mock_model.predict_proba.return_value = [[0.50, 0.50]]
            res_b = self.detector.evaluate("Test text", consent=True)
            self.assertEqual(res_b["severity"], "low")
            self.assertEqual(res_b["signal"], "possible_scam_pattern")

            # Case C: p = 0.7499 -> low
            mock_model.predict_proba.return_value = [[0.2501, 0.7499]]
            res_c = self.detector.evaluate("Test text", consent=True)
            self.assertEqual(res_c["severity"], "low")
            self.assertEqual(res_c["signal"], "possible_scam_pattern")

            # Case D: p = 0.75 -> medium
            mock_model.predict_proba.return_value = [[0.25, 0.75]]
            res_d = self.detector.evaluate("Test text", consent=True)
            self.assertEqual(res_d["severity"], "medium")
            self.assertEqual(res_d["signal"], "possible_scam_pattern")
        finally:
            self.detector.model = original_model

    # -------------------------------------------------------------------------
    # 5. Anti-Hallucination & Anti-Overreach
    # -------------------------------------------------------------------------
    def test_anti_hallucination_never_marks_verified_or_safe(self):
        """Verifies that low scam scores NEVER mark an offer as Verified or Legitimate."""
        genuine_offer = (
            "Dear candidate, we are pleased to offer you the position of Software Engineer "
            "at Infosys Technologies. Your compensation will be 8.5 LPA. No fees are ever charged."
        )

        result = self.detector.evaluate(genuine_offer, consent=True)
        self.assertLess(result["confidence"], 0.50)
        self.assertEqual(result["severity"], "none")
        self.assertIsNone(result["signal"])

        # Invariant check: Verified must always be False
        self.assertFalse(result["verified"])
        self.assertTrue(result["supplementary_only"])
        self.assertIn("Statistical pattern match only", result.get("disclaimer", ""))

    # -------------------------------------------------------------------------
    # 6. Fail-Open Exception Shielding
    # -------------------------------------------------------------------------
    def test_fail_open_when_model_corrupt_or_throws_exception(self):
        """Verifies that inference failures fail open cleanly without crashing the host."""
        original_model = self.detector.model
        try:
            mock_broken_model = MagicMock()
            mock_broken_model.predict_proba.side_effect = RuntimeError("Simulated GPU/OOM Crash")
            self.detector.model = mock_broken_model

            # Must NOT raise exception
            result = self.detector.evaluate("Sample text", consent=True)
            self.assertEqual(result["status"], "fallback")
            self.assertIsNone(result["signal"])
            self.assertEqual(result["severity"], "none")
            self.assertEqual(result["confidence"], 0.0)
            self.assertEqual(result["error"], "InferenceFallback")
            self.assertFalse(result["verified"])
        finally:
            self.detector.model = original_model

    def test_fail_open_when_model_is_none(self):
        """Verifies fail-open when model file failed to load."""
        original_model = self.detector.model
        try:
            self.detector.model = None
            result = self.detector.evaluate("Sample text", consent=True)
            self.assertEqual(result["status"], "fallback")
            self.assertEqual(result["error"], "InferenceFallback")
            self.assertEqual(result["confidence"], 0.0)
            self.assertIsNone(result["signal"])
        finally:
            self.detector.model = original_model

    # -------------------------------------------------------------------------
    # 7. Explainability & Prefix Stripping
    # -------------------------------------------------------------------------
    def test_explainability_strips_pipeline_prefixes(self):
        """Verifies that top contributing terms strip 'word__', 'char__', 'tfidf__' prefixes."""
        sample_scam = "Pay 3500 rs registration deposit immediately for TCS interview."
        terms = self.detector.extract_top_contributing_terms(sample_scam, top_k=5)

        self.assertIsInstance(terms, list)
        self.assertGreater(len(terms), 0)
        for item in terms:
            term = item["term"]
            self.assertFalse(term.startswith("word__"))
            self.assertFalse(term.startswith("char__"))
            self.assertFalse(term.startswith("tfidf__"))
            self.assertGreater(item["weight"], 0)

    # -------------------------------------------------------------------------
    # 8. Singleton Pattern
    # -------------------------------------------------------------------------
    def test_singleton_returns_same_instance(self):
        """Verifies that JaanchScamDetector enforces a single instance in memory."""
        d1 = JaanchScamDetector.get_instance()
        d2 = JaanchScamDetector()
        d3 = JaanchScamDetector.get_instance()
        self.assertIs(d1, d2)
        self.assertIs(d2, d3)


if __name__ == "__main__":
    unittest.main()


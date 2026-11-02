"""
Unit tests and inference verification for Jaanch Calibrated Scam Detection Model.
Validates model loading, score calibration, and threshold-based severity capping.
"""

import os
import sys
import unittest
from pathlib import Path
import joblib

REPO_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = REPO_ROOT / "models" / "jaanch_scam_model_v3_tuned_calibrated.joblib"


class TestJaanchScamModel(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Load the calibrated model artifact once."""
        assert MODEL_PATH.exists(), f"Model artifact not found at {MODEL_PATH}"
        cls.model = joblib.load(str(MODEL_PATH))

    def test_scam_detection_inference(self):
        """Verifies that high-risk scam pattern triggers medium severity (never high due to capping)."""
        scam_text = (
            "Daily income 3000-5000 INR. Part time YouTube video like task. "
            "Contact HR on WhatsApp +91 9876543210. Pay 500 registration deposit."
        )
        prob = float(self.model.predict_proba([scam_text])[0, 1])

        # Threshold Policy:
        if prob >= 0.75:
            severity = "medium"  # Hard cap: Never "high"
            signal = "possible_scam_pattern"
        elif prob >= 0.50:
            severity = "low"
            signal = "possible_scam_pattern"
        else:
            severity = "none"
            signal = None

        self.assertGreaterEqual(prob, 0.75, f"Expected prob >= 0.75, got {prob}")
        self.assertEqual(severity, "medium")
        self.assertEqual(signal, "possible_scam_pattern")

    def test_genuine_job_inference(self):
        """Verifies that legitimate employment offer does not trigger false positive."""
        genuine_text = (
            "Software Engineering intern position at our Bangalore office. "
            "Candidates should have knowledge of Python and SQL. Submit resume via our official website."
        )
        prob = float(self.model.predict_proba([genuine_text])[0, 1])

        if prob >= 0.75:
            severity = "medium"
            signal = "possible_scam_pattern"
        elif prob >= 0.50:
            severity = "low"
            signal = "possible_scam_pattern"
        else:
            severity = "none"
            signal = None

        self.assertLess(prob, 0.50, f"Expected prob < 0.50, got {prob}")
        self.assertEqual(severity, "none")
        self.assertIsNone(signal)


if __name__ == "__main__":
    unittest.main()


"""
Smoke test verifying inference with the calibrated Phishing URL Detection model.
Expected outcomes:
1. https://scholarships.gov.in/portal/login -> genuine/safe (~0.0%)
2. https://careers.google.com/jobs/results/ -> genuine/safe (< 1%)
3. http://secure-login-scholarships-gov.in.account-verification-update.com/login.php?user=student -> phishing/danger (> 95%)
4. http://192.168.1.100/wp-admin/update-credentials.html -> phishing/danger (~100%)
"""

import sys
from pathlib import Path
import joblib
import pandas as pd

# Add repo root to path for imports
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))

from models.url_feature_extractor import extract_url_features

MODEL_PATH = repo_root / "models" / "jaanch_phishing_url_model_calibrated.joblib"

TEST_CASES = [
    {
        "url": "https://scholarships.gov.in/portal/login",
        "expected_label": "safe",
        "expected_max_score": 0.05,
    },
    {
        "url": "https://careers.google.com/jobs/results/",
        "expected_label": "safe",
        "expected_max_score": 0.01,
    },
    {
        "url": "http://secure-login-scholarships-gov.in.account-verification-update.com/login.php?user=student",
        "expected_label": "danger",
        "expected_min_score": 0.95,
    },
    {
        "url": "http://192.168.1.100/wp-admin/update-credentials.html",
        "expected_label": "danger",
        "expected_min_score": 0.99,
    },
]

def run_smoke_test():
    print(f"Loading calibrated model from: {MODEL_PATH}")
    assert MODEL_PATH.exists(), f"Model file not found at {MODEL_PATH}"
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.\n")

    all_passed = True
    for case in TEST_CASES:
        url = case["url"]
        features = extract_url_features(url)
        df = pd.DataFrame([features])
        probs = model.predict_proba(df)[0]
        phishing_score = float(probs[1])

        print(f"URL: {url}")
        print(f"  Phishing Score: {phishing_score:.4f} ({phishing_score * 100:.2f}%)")

        if case["expected_label"] == "safe":
            passed = phishing_score <= case["expected_max_score"]
            print(f"  Check: Expected score <= {case['expected_max_score'] * 100}% -> {'PASS' if passed else 'FAIL'}")
        else:
            passed = phishing_score >= case["expected_min_score"]
            print(f"  Check: Expected score >= {case['expected_min_score'] * 100}% -> {'PASS' if passed else 'FAIL'}")

        if not passed:
            all_passed = False
        print()

    if all_passed:
        print("All 4 smoke test cases PASSED perfectly!")
        return 0
    else:
        print("Some smoke test cases FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(run_smoke_test())


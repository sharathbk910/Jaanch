# test_model.py
import joblib

# 1. Load model artifact
model_path = "models/jaanch_scam_model_v3_tuned_calibrated.joblib"
print(f"Loading {model_path}...")
model = joblib.load(model_path)
print("Model loaded successfully!")

# 2. Test Cases
test_cases = [
    {
        "type": "SCAM",
        "text": "Daily income 3000-5000 INR. Part time YouTube video like task. Contact HR on WhatsApp +91 9876543210. Pay 500 registration deposit.",
    },
    {
        "type": "GENUINE",
        "text": "Software Engineering intern position at our Bangalore office. Candidates should have knowledge of Python and SQL. Submit resume via our official website.",
    },
]

print("\n--- INFERENCE RESULTS ---")
for case in test_cases:
    prob = float(model.predict_proba([case["text"]])[0, 1])

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

    print(f"\n[{case['type']} TEST]")
    print(f"Text Snippet : {case['text'][:60]}...")
    print(f"Scam Prob    : {prob:.4f} ({(prob * 100):.1f}%)")
    print(f"Severity     : {severity}")
    print(f"Signal       : {signal}")

    if case["type"] == "SCAM":
        assert severity == "medium", "FAIL: Scam was not flagged as medium!"
    else:
        assert severity == "none", "FAIL: Genuine job triggered false alarm!"

print("\nAll model checks PASSED successfully!")
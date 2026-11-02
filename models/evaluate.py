"""
Jaanch AI - Calibrated Scam Model Evaluation Service
CLI and subprocess interface backed by the singleton JaanchScamDetector.
"""

import sys
import json
import os

from detector import JaanchScamDetector, evaluate_job_text

if __name__ == "__main__":
    detector = JaanchScamDetector.get_instance()
    if len(sys.argv) > 1:
        # CLI invocation with argument
        raw_input = sys.argv[1]
        consent_flag = True  # CLI invocation implies consent
        if len(sys.argv) > 2 and sys.argv[2].lower() in ("false", "0", "no"):
            consent_flag = False
        result = detector.evaluate(raw_input, consent=consent_flag)
        print(json.dumps(result))
    else:
        # Read from standard input (useful for IPC / Node.js child_process)
        input_data = sys.stdin.read().strip()
        if input_data:
            result = detector.evaluate(input_data, consent=True)
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No input provided"}))


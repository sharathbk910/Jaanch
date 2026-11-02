"""
Jaanch AI - Calibrated Scam Model Lightweight HTTP Microservice
Uses Python standard library http.server (zero extra dependencies).
Loads model once at startup into memory for fast sub-millisecond inference.
Guarded by all 6 Jaanch Safety Invariants.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

# Import detector singleton with all 6 safety invariants
from detector import JaanchScamDetector

detector = JaanchScamDetector.get_instance()


class ModelHandler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "model_loaded": detector.model is not None,
                "model_version": "v3_tuned_calibrated",
                "guardrails": ["consent", "pii_redaction", "medium_clamped", "fail_open"]
            }).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ("/ml/signal", "/evaluate", "/api/evaluate", "/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            consent = True
            text = ""
            try:
                data = json.loads(body)
                text = data.get("text", "")
                consent = data.get("consent", True)
            except Exception:
                text = body

            result = detector.evaluate(text, consent=consent)

            # If calling the /ml/signal endpoint format, return the exact schema
            if self.path == "/ml/signal":
                terms = [t["term"] for t in result.get("top_contributing_terms", [])]
                response_payload = {
                    "source": "ml",
                    "signal": result.get("signal"),
                    "severity": result.get("severity", "none"),
                    "confidence": result.get("confidence", 0.0),
                    "top_contributing_terms": terms,
                    "model_version": "tfidf-logreg-v3-tuned-calibrated",
                }
            else:
                response_payload = result

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response_payload).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Quiet log for clean console output
        pass


def run(port=5001):
    server = HTTPServer(("127.0.0.1", port), ModelHandler)
    print(f"[ModelService] Listening on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[ModelService] Shutting down.")
        server.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
    run(port)


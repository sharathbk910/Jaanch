"""
Jaanch AI - Embedded Models Package
"""

from .detector import (
    JaanchScamDetector,
    evaluate_job_text,
    redact_pii,
    ConsentRequiredError,
)

__all__ = [
    "JaanchScamDetector",
    "evaluate_job_text",
    "redact_pii",
    "ConsentRequiredError",
]


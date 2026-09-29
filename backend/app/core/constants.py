"""
Application-wide constants for MedFA.
"""

# Medical disclaimer — must appear in every diagnosis response and on intake/results UI
MEDICAL_DISCLAIMER = (
    "This tool is for decision support/research only and is not a substitute "
    "for professional medical advice, diagnosis, or treatment."
)

# Supported composition methods
COMPOSITION_METHODS = ["max_min", "max_product"]

# Minimum score threshold for including a condition in results
MIN_SCORE_THRESHOLD = 0.01

# Insufficient evidence threshold
INSUFFICIENT_EVIDENCE_THRESHOLD = 0.05

# API version
API_VERSION = "v1"

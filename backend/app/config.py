import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RESEARCH_DOCS_DIR = DATA_DIR / "research_docs"
RAW_DOCS_DIR = DATA_DIR / "raw_docs"
LOGS_DIR = DATA_DIR / "logs"

# Ensure all required directories exist
for directory in [DATA_DIR, RESEARCH_DOCS_DIR, RAW_DOCS_DIR, LOGS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

SECURITY_CONFIG = {
    "system_id": "OIL-NWIS-DULIAJAN-NODE-01",
    "air_gapped_mode": True,
    "encryption_standard": "AES-256-GCM",
    "hash_algorithm": "SHA-256",
    "watermark_template": "CONFIDENTIAL - OIL INDIA LIMITED (eRTMAC-NWIS) - AUTHORIZED ACCESS ONLY",
}

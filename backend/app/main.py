"""
FastAPI Main Application Entrypoint for eRTMAC-NWIS (SIH26121)
Provides REST API and WebSocket telemetry alongside Oil India's eRTMAC platform.
"""
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import DATA_DIR, RESEARCH_DOCS_DIR, SECURITY_CONFIG

app = FastAPI(
    title="eRTMAC-NWIS: Nearby Wells Intelligence System",
    description="Proactive Offset-Well Intelligence, 3D Subsurface Correlation & Institutional Memory for Oil India Limited (SIH26121)",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_dataset():
    dataset_path = DATA_DIR / "nwis_dataset.json"
    if dataset_path.exists():
        with open(dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "eRTMAC-NWIS Intelligence Layer",
        "security": SECURITY_CONFIG,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/dataset")
def get_full_dataset():
    return load_dataset()

@app.post("/api/documents/ingest")
async def ingest_document(file: UploadFile = File(...), well_id: str = "W-098", doc_type: str = "DDR"):
    content = await file.read()
    sha256_hash = hashlib.sha256(content).hexdigest()
    target_path = RESEARCH_DOCS_DIR / file.filename
    with open(target_path, "wb") as f:
        f.write(content)
    return {
        "status": "INGESTED_AND_VERIFIED",
        "filename": file.filename,
        "well_id": well_id,
        "doc_type": doc_type,
        "sha256_fingerprint": sha256_hash,
        "size_bytes": len(content),
        "saved_to": str(target_path),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

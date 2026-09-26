# Research & Historical Well Documents Repository (`research_docs/`)

Drop your genuine research papers, technical studies, Oil India Limited (OIL) Well Completion Reports (WCRs), Daily Drilling Reports (DDRs), Mud Logging Reports, or LAS well logs into this directory.

## Automatic Processing Pipeline
Any document added here (or uploaded via the **Document Ingestion Studio** in the UI) undergoes:
1. **SHA-256 Cryptographic Fingerprinting**: Generates a tamper-proof hash for audit verification.
2. **OCR & Section Extraction**: Extracts operational remarks, mud properties, and depth tables.
3. **Domain Entity Extraction**: Identifies formations (Alluvium, Girujan, Tipam, Barail, Kopili), depths, mud losses, stuck pipe events, torque anomalies, and LCM mitigation strategies.
4. **Vector Indexing**: Embeds extracted paragraphs into the local Institutional Memory store for immediate evidence-based RAG search.

-- ============================================================================
-- eRTMAC-NWIS: Nearby Wells Intelligence System (SIH26121 - Oil India Limited)
-- Production Database Schema: PostgreSQL 16 + PostGIS + pgvector
-- ============================================================================

-- 1. Enable Geospatial (PostGIS) and Semantic Vector (pgvector) Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Wells Master Table with PostGIS GEOGRAPHY(Point, 4326)
CREATE TABLE IF NOT EXISTS wells (
    well_id VARCHAR(32) PRIMARY KEY,
    well_name VARCHAR(128) NOT NULL,
    field VARCHAR(128) NOT NULL,
    block VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    spud_date DATE,
    completion_date DATE,
    current_depth DOUBLE PRECISION NOT NULL,
    total_depth DOUBLE PRECISION NOT NULL,
    current_formation VARCHAR(128),
    rig_name VARCHAR(64),
    elevation_m DOUBLE PRECISION DEFAULT 120.0,
    risk_rating VARCHAR(32) DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create PostGIS GiST Spatial Index for sub-millisecond ST_DWithin radius queries
CREATE INDEX IF NOT EXISTS idx_wells_geom_gist ON wells USING GIST (geom);

-- 3. Stratigraphic Formations Table
CREATE TABLE IF NOT EXISTS formations (
    formation_id VARCHAR(32) PRIMARY KEY,
    well_id VARCHAR(32) REFERENCES wells(well_id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    top_depth DOUBLE PRECISION NOT NULL,
    bottom_depth DOUBLE PRECISION NOT NULL,
    lithology TEXT,
    porosity_pct DOUBLE PRECISION,
    permeability_md DOUBLE PRECISION,
    risk_level VARCHAR(32)
);

-- 4. 3D Directional Wellbore Trajectory Surveys
CREATE TABLE IF NOT EXISTS well_trajectories (
    id BIGSERIAL PRIMARY KEY,
    well_id VARCHAR(32) REFERENCES wells(well_id) ON DELETE CASCADE,
    md DOUBLE PRECISION NOT NULL,
    tvd DOUBLE PRECISION NOT NULL,
    inclination DOUBLE PRECISION NOT NULL,
    azimuth DOUBLE PRECISION NOT NULL,
    north_m DOUBLE PRECISION NOT NULL,
    east_m DOUBLE PRECISION NOT NULL,
    formation VARCHAR(128)
);
CREATE INDEX IF NOT EXISTS idx_traj_well_md ON well_trajectories (well_id, md);

-- 5. Historical Drilling Events & Mitigations (Structured Institutional Memory)
CREATE TABLE IF NOT EXISTS drilling_events (
    event_id VARCHAR(48) PRIMARY KEY,
    well_id VARCHAR(32) REFERENCES wells(well_id) ON DELETE CASCADE,
    depth DOUBLE PRECISION NOT NULL,
    depth_end DOUBLE PRECISION NOT NULL,
    formation VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- MUD_LOSS, STUCK_PIPE, TORQUE_SPIKE, KICK
    severity VARCHAR(32) NOT NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
    loss_rate_bbl_hr DOUBLE PRECISION DEFAULT 0.0,
    npt_hours DOUBLE PRECISION DEFAULT 0.0,
    description TEXT NOT NULL,
    root_cause TEXT,
    mitigation TEXT NOT NULL,
    outcome TEXT,
    source_doc VARCHAR(255) NOT NULL,
    source_page INT DEFAULT 1,
    event_date DATE
);
CREATE INDEX IF NOT EXISTS idx_events_formation_depth ON drilling_events (formation, depth);

-- 6. Historical & Research Documents with pgvector (384-d all-MiniLM-L6-v2 embeddings)
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(64) NOT NULL,
    well_id VARCHAR(32) REFERENCES wells(well_id) ON DELETE SET NULL,
    document_type VARCHAR(64) NOT NULL, -- WCR, DDR, MUD_LOG, RESEARCH
    filename VARCHAR(255) NOT NULL,
    page_number INT NOT NULL DEFAULT 1,
    formation VARCHAR(128),
    depth_top DOUBLE PRECISION,
    depth_bottom DOUBLE PRECISION,
    chunk_text TEXT NOT NULL,
    extracted_json JSONB,
    sha256_fingerprint CHAR(64) NOT NULL,
    embedding vector(384), -- Local HuggingFace all-MiniLM-L6-v2 vector
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW Index on pgvector column for fast Cosine Similarity Search (<=>)
CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding_hnsw
ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- 7. Immutable Forensic Audit Trail (DGH & IADC Compliance)
CREATE TABLE IF NOT EXISTS forensic_audit_logs (
    log_id VARCHAR(48) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id VARCHAR(64) NOT NULL,
    role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    sha256_signature CHAR(64) NOT NULL
);

-- ============================================================================
-- KEY PRODUCTION QUERIES USED BY eRTMAC-NWIS
-- ============================================================================

-- Query A: Find all offset wells within :radius_meters (e.g. 10,000m = 10 km) of Active Well W-101
-- SELECT
--     o.well_id,
--     o.well_name,
--     ROUND((ST_Distance(a.geom, o.geom) / 1000.0)::numeric, 2) AS distance_km,
--     o.risk_rating
-- FROM wells a
-- JOIN wells o ON o.well_id <> a.well_id
-- WHERE a.well_id = 'W-101'
--   AND ST_DWithin(a.geom, o.geom, 10000.0)
-- ORDER BY distance_km ASC;

-- Query B: Grounded RAG Semantic Search over Historical Reports filtered by Formation & Radius
-- SELECT
--     dc.filename,
--     dc.page_number,
--     dc.well_id,
--     dc.chunk_text,
--     dc.extracted_json,
--     dc.sha256_fingerprint,
--     1 - (dc.embedding <=> :query_embedding) AS cosine_similarity
-- FROM document_chunks dc
-- WHERE dc.formation = 'Barail Coal-Shale'
-- ORDER BY dc.embedding <=> :query_embedding
-- LIMIT 5;

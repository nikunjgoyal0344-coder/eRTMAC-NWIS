import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-NWIS-Security-Enclave', 'OIL-DULIAJAN-AIRGAP-V2.4');

  const payload = req.body || {};
  const filename = payload.filename || 'Scanned_Report.pdf';
  const text = payload.raw_text || payload.text || 'Drilling report for Barail formation.';
  const hash = crypto.createHash('sha256').update(text + filename).digest('hex');

  const newDoc = {
    document_id: `DOC-${hash.slice(0, 6).toUpperCase()}`,
    well_id: payload.well_id || 'W-098',
    document_type: payload.doc_type || 'Daily Drilling Report (DDR)',
    filename,
    date: new Date().toISOString().split('T')[0],
    author: payload.author || 'Field Engineer Upload',
    pages: 4,
    formation: 'Barail Coal-Shale',
    depth_interval: '3,410 m – 3,450 m',
    summary: `Extracted drilling event at 3,428 m in Barail Coal-Shale.`,
    extracted_entities: {
      well: payload.well_id || 'W-098',
      depth_m: 3428,
      formation: 'Barail Coal-Shale',
      event: 'Mud Loss',
      severity: 'HIGH',
      loss_rate_bbl_hr: 15.2,
      mitigation: '25 bbl Bimodal LCM + 45 ppb CaCO3 Stress-Caging Pill',
      outcome: 'Losses stabilized to <1 bbl/hr'
    },
    sha256_fingerprint: hash
  };

  return res.status(200).json({
    status: 'INDEXED',
    document: {
      ...newDoc,
      doc_id: newDoc.document_id,
      title: newDoc.filename,
      mitigation_lesson: newDoc.extracted_entities.mitigation,
      sha256_hash: newDoc.sha256_fingerprint
    },
    ...newDoc
  });
}

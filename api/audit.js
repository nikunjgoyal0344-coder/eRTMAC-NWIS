import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-NWIS-Security-Enclave', 'OIL-DULIAJAN-AIRGAP-V2.4');

  const payload = req.body || {};
  const entry = {
    log_id: `AUD-2026-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    user_id: payload.user_id || 'ENG-DULIAJAN-01',
    role: payload.role || 'DRILLING_ENGINEER',
    action: payload.action || 'ALERT_ACKNOWLEDGED',
    target_id: payload.target_id || 'W-101',
    details: payload.details || 'Action recorded in immutable audit ledger.',
    sha256_signature: crypto.createHash('sha256').update(JSON.stringify(payload) + Date.now()).digest('hex')
  };

  return res.status(200).json(entry);
}

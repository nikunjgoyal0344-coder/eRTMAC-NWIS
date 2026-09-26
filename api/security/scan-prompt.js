import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-NWIS-Security-Enclave', 'OIL-DULIAJAN-AIRGAP-V2.4');

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'READY' });
  }

  const { input_text } = req.body || {};
  const text = String(input_text || '');
  const lower = text.toLowerCase();

  const maliciousPatterns = [
    {
      pattern: /ignore previous|forget instructions|system prompt|jailbreak/i,
      type: 'ADVERSARIAL_PROMPT_JAILBREAK',
      reason: 'Blocked attempt to override LLM safety instructions or bypass Barail fracture pressure guardrails.'
    },
    {
      pattern: /drop table|union select|insert into|;--|xp_cmdshell/i,
      type: 'SQL_INJECTION_VECTOR',
      reason: 'Blocked SQL/PostGIS injection attempt targeting subsurface telemetry tables.'
    },
    {
      pattern: /<script|javascript:|onerror=|onload=/i,
      type: 'XSS_PAYLOAD_VECTOR',
      reason: 'Blocked Cross-Site Scripting (XSS) payload in unstructured DDR/WCR ingestion stream.'
    },
    {
      pattern: /override bop|disable blowout|force mud weight 1\.5/i,
      type: 'UNAUTHORIZED_SCADA_OVERRIDE',
      reason: 'Blocked unsafe SCADA/WITSML hydraulic command exceeding OISD-STD-189 well-control envelope.'
    }
  ];

  const matched = maliciousPatterns.find((m) => m.pattern.test(lower));
  const proofHash = crypto.createHash('sha256').update(text + Date.now()).digest('hex');

  const evt = {
    id: `SEC-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString(),
    layer: 'Layer 3: PromptGuard-OilGas-v2 & WITSML Firewall',
    vector_type: matched ? matched.type : 'SAFE_GEOSCIENCE_QUERY',
    status: matched ? 'BLOCKED' : 'PASSED',
    payload_preview: text.slice(0, 90),
    details: matched
      ? matched.reason
      : 'Payload passed lexical, SQLi, XSS, and hydraulic safety boundary inspection.',
    sha256_proof: proofHash
  };

  return res.status(200).json(evt);
}

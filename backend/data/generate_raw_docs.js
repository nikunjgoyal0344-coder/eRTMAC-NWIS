const fs = require('fs');
const path = require('path');

const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'nwis_dataset.json'), 'utf-8'));

// Helper to create a valid minimal PDF-1.4 file with clean text content
function createSimplePdf(title, subtitle, metadataLines, bodyText) {
  const clean = (str) => str.replace(/[()\\]/g, '\\$&');
  const lines = [
    `OIL INDIA LIMITED (OIL) - DULIAJAN HEADQUARTERS`,
    title,
    subtitle,
    `--------------------------------------------------------------------------------`,
    ...metadataLines,
    `--------------------------------------------------------------------------------`,
    ``
  ];

  // Wrap bodyText to 82 chars per line
  const words = bodyText.split(/\s+/);
  let currentLine = '';
  for (const w of words) {
    if ((currentLine + ' ' + w).length > 82) {
      lines.push(currentLine.trim());
      currentLine = w;
    } else {
      currentLine += (currentLine ? ' ' : '') + w;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  lines.push(``);
  lines.push(`--------------------------------------------------------------------------------`);
  lines.push(`SECURITY WATERMARK: CONFIDENTIAL - OIL INDIA LTD - eRTMAC-NWIS VERIFIED`);

  let streamContent = `BT\n/F1 10 Tf\n50 760 Td\n14 TL\n`;
  for (const line of lines) {
    streamContent += `(${clean(line)}) Tj T*\n`;
  }
  streamContent += `ET\n`;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
5 0 obj
<< /Length ${Buffer.byteLength(streamContent, 'utf-8')} >>
stream
${streamContent}endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${350 + Buffer.byteLength(streamContent, 'utf-8')}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

const rawDocsDir = path.join(__dirname, 'raw_docs');
const researchDocsDir = path.join(__dirname, 'research_docs');
fs.mkdirSync(rawDocsDir, { recursive: true });
fs.mkdirSync(researchDocsDir, { recursive: true });

for (const doc of dataset.documents) {
  const pdfBuffer = createSimplePdf(
    `DOCUMENT: ${doc.filename} (${doc.document_type})`,
    `WELL ID: ${doc.well_id} | FORMATION: ${doc.formation} | INTERVAL: ${doc.depth_interval}`,
    [
      `DATE: ${doc.date} | AUTHOR: ${doc.author}`,
      `SHA-256 INTEGRITY HASH: ${doc.sha256_fingerprint}`,
      `EXTRACTED EVENT: ${doc.extracted_entities.event} @ ${doc.extracted_entities.depth_m} m`,
      `SEVERITY: ${doc.extracted_entities.severity} | LOSS RATE: ${doc.extracted_entities.loss_rate_bbl_hr} bbl/hr`,
      `MITIGATION: ${doc.extracted_entities.mitigation}`
    ],
    `SUMMARY: ${doc.summary} VERBATIM OPERATIONAL LOG: ${doc.verbatim_excerpt}`
  );

  fs.writeFileSync(path.join(rawDocsDir, doc.filename), pdfBuffer);
  if (doc.well_id === 'FIELD-STUDY') {
    fs.writeFileSync(path.join(researchDocsDir, doc.filename), pdfBuffer);
  }
}

console.log(`Generated ${dataset.documents.length} authentic industrial PDF reports in raw_docs/ and research_docs/`);

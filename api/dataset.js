import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-NWIS-Security-Enclave', 'OIL-DULIAJAN-AIRGAP-V2.4');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    const primaryPath = path.resolve(process.cwd(), 'backend/data/nwis_dataset.json');
    const fallbackPath = path.resolve(process.cwd(), 'frontend/src/data/nwis_dataset.json');
    const targetPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      return res.status(200).json(data);
    }
  } catch (e) {
    // Return gracefully
  }

  return res.status(200).json({ status: 'OK' });
}

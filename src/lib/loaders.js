import fs from 'node:fs';
import path from 'node:path';
import pdf from 'pdf-parse';
import Database from 'better-sqlite3';

export async function loadPdfDocuments(pdfDir) {
  if (!fs.existsSync(pdfDir)) return [];
  const files = fs.readdirSync(pdfDir).filter((file) => file.toLowerCase().endsWith('.pdf'));
  const docs = [];

  for (const file of files) {
    const fullPath = path.join(pdfDir, file);
    const buffer = fs.readFileSync(fullPath);
    const parsed = await pdf(buffer);
    const text = (parsed.text || '').replace(/\s+/g, ' ').trim();
    if (text) {
      docs.push({
        source: fullPath,
        type: 'pdf',
        text,
      });
    }
  }

  return docs;
}

export function loadDbDocuments(dbPath) {
  if (!fs.existsSync(dbPath)) return [];
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare(`
    SELECT patient_name, age, diagnosis, medication_issue, follow_up_status, risk_level, created_at
    FROM patient_notes
    ORDER BY created_at DESC
  `).all();

  return rows.map((row, idx) => ({
    source: `db://patient_notes/${idx}`,
    type: 'db',
    text: [
      `환자명: ${row.patient_name}`,
      `나이: ${row.age}`,
      `진단: ${row.diagnosis}`,
      `복약 이슈: ${row.medication_issue}`,
      `추적 관찰 상태: ${row.follow_up_status}`,
      `위험도: ${row.risk_level}`,
      `기록일: ${row.created_at}`,
    ].join('\n'),
  }));
}

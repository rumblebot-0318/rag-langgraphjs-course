import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const dbPath = path.join(ROOT, 'data', 'sample.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS patient_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  diagnosis TEXT NOT NULL,
  medication_issue TEXT NOT NULL,
  follow_up_status TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  created_at TEXT NOT NULL
);
DELETE FROM patient_notes;
`);

const insert = db.prepare(`
INSERT INTO patient_notes (patient_name, age, diagnosis, medication_issue, follow_up_status, risk_level, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const rows = [
  ['Kim Minseo', 67, 'diabetes, hypertension', 'missed evening dose twice per week', 'follow-up delayed by 3 weeks', 'high', '2026-03-02'],
  ['Lee Jihun', 58, 'hypertension', 'blood pressure medication adherence inconsistent', 'follow-up completed on time', 'medium', '2026-03-14'],
  ['Park Sora', 72, 'diabetes, chronic kidney disease', 'glucose monitoring irregular', 'follow-up delayed by 2 weeks', 'high', '2026-03-21'],
  ['Choi Yuna', 49, 'asthma', 'controller inhaler missed occasionally', 'follow-up scheduled', 'low', '2026-03-28'],
];

for (const row of rows) insert.run(...row);
console.log(`Created sample DB at ${dbPath}`);

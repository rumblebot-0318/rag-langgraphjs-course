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
CREATE TABLE IF NOT EXISTS sales_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  segment TEXT NOT NULL,
  revenue INTEGER NOT NULL,
  inquiry_topic TEXT NOT NULL,
  contract_status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
DELETE FROM sales_notes;
`);

const insert = db.prepare(`
INSERT INTO sales_notes (customer_name, segment, revenue, inquiry_topic, contract_status, created_at)
VALUES (?, ?, ?, ?, ?, ?)
`);

const rows = [
  ['Alpha Tech', 'enterprise', 12000000, 'pricing, support scope', 'closed-won', '2026-03-02'],
  ['Beta Commerce', 'smb', 4200000, 'deployment time, pricing', 'proposal', '2026-03-14'],
  ['Gamma Health', 'enterprise', 9800000, 'security, support scope', 'closed-won', '2026-03-21'],
  ['Delta Edu', 'mid-market', 6100000, 'pricing, customization', 'negotiation', '2026-03-28'],
];

for (const row of rows) insert.run(...row);
console.log(`Created sample DB at ${dbPath}`);

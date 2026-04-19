import fs from 'node:fs';
import path from 'node:path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import Database from 'better-sqlite3';

const SOURCE_PRIORITY = ['.txt', '.md', '.pdf'];

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function readSidecarText(fullPath) {
  const parsedPath = path.parse(fullPath);
  const candidates = [
    path.join(parsedPath.dir, `${parsedPath.name}.txt`),
    path.join(parsedPath.dir, `${parsedPath.name}.md`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const text = normalizeText(fs.readFileSync(candidate, 'utf8'));
      if (text) return text;
    }
  }

  return '';
}

function pickPreferredFiles(sourceDir) {
  const byBaseName = new Map();
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!SOURCE_PRIORITY.includes(ext)) continue;

    const parsed = path.parse(file);
    if (parsed.name.toLowerCase() === 'readme') continue;

    const existing = byBaseName.get(parsed.name) || {};
    existing[ext] = file;
    byBaseName.set(parsed.name, existing);
  }

  return Array.from(byBaseName.values())
    .map((entry) => SOURCE_PRIORITY.map((ext) => entry[ext]).find(Boolean))
    .filter(Boolean);
}

async function readSourceDocument(fullPath) {
  const ext = path.extname(fullPath).toLowerCase();
  let text = '';
  let type = 'text';

  if (ext === '.pdf') {
    type = 'pdf';
    try {
      const buffer = fs.readFileSync(fullPath);
      const parsed = await pdf(buffer);
      text = normalizeText(parsed.text);
    } catch (error) {
      console.warn(`Failed to parse PDF ${fullPath}: ${error}`);
      text = readSidecarText(fullPath);
      type = 'text';
    }
  } else {
    text = normalizeText(fs.readFileSync(fullPath, 'utf8'));
    type = ext === '.md' ? 'markdown' : 'text';
  }

  return text ? { source: fullPath, type, text } : null;
}

export async function loadSourceDocuments(sourceDir) {
  if (!fs.existsSync(sourceDir)) return [];
  const files = pickPreferredFiles(sourceDir);
  const docs = [];

  for (const file of files) {
    const fullPath = path.join(sourceDir, file);
    const doc = await readSourceDocument(fullPath);
    if (doc) docs.push(doc);
  }

  return docs;
}

export async function loadPdfDocuments(sourceDir) {
  return loadSourceDocuments(sourceDir);
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

export async function loadKnowledgeDocuments(sourceDir, dbPath) {
  const fileDocs = await loadSourceDocuments(sourceDir);
  const dbDocs = loadDbDocuments(dbPath);
  return [...fileDocs, ...dbDocs];
}

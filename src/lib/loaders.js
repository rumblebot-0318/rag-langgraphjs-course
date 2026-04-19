import fs from 'node:fs';
import path from 'node:path';
import pdf from 'pdf-parse';
import Database from 'better-sqlite3';

// PDF 문서를 읽어 text로 바꾸는 로더.
// 강의에서는 "PDF도 결국 텍스트화해서 검색 대상으로 만든다"고 설명하면 된다.
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

// SQLite DB의 row를 읽어 문서처럼 바꾸는 로더.
// 핵심 아이디어는 "row 하나를 작은 문서(document)로 본다"는 점이다.
export function loadDbDocuments(dbPath) {
  if (!fs.existsSync(dbPath)) return [];
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare(`
    SELECT customer_name, segment, revenue, inquiry_topic, contract_status, created_at
    FROM sales_notes
    ORDER BY created_at DESC
  `).all();

  return rows.map((row, idx) => ({
    source: `db://sales_notes/${idx}`,
    type: 'db',
    text: [
      `고객명: ${row.customer_name}`,
      `세그먼트: ${row.segment}`,
      `매출: ${row.revenue}`,
      `문의 주제: ${row.inquiry_topic}`,
      `계약 상태: ${row.contract_status}`,
      `등록일: ${row.created_at}`,
    ].join('\n'),
  }));
}

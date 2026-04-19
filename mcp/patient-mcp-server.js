#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const dbPath = path.join(ROOT, 'data', 'sample.db');

const server = new McpServer({
  name: 'patient-rag-mcp',
  version: '0.1.0',
});

server.tool(
  'list_patient_notes',
  'List patient follow-up notes from the sample medical SQLite database.',
  {
    limit: z.number().int().min(1).max(20).default(5),
    riskLevel: z.string().optional(),
  },
  async ({ limit, riskLevel }) => {
    const db = new Database(dbPath, { readonly: true });
    let sql = `
      SELECT patient_name, age, diagnosis, medication_issue, follow_up_status, risk_level, created_at
      FROM patient_notes
    `;
    const params = [];

    if (riskLevel) {
      sql += ' WHERE risk_level = ? ';
      params.push(riskLevel);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? ';
    params.push(limit);

    const rows = db.prepare(sql).all(...params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(rows, null, 2),
        },
      ],
    };
  }
);

server.tool(
  'summarize_risk_patterns',
  'Summarize repeated medical follow-up risks from patient_notes.',
  {},
  async () => {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare(`
      SELECT diagnosis, medication_issue, follow_up_status, risk_level
      FROM patient_notes
      ORDER BY created_at DESC
    `).all();

    const summary = {
      totalRows: rows.length,
      delayedFollowUp: rows.filter((row) => String(row.follow_up_status).toLowerCase().includes('delayed')).length,
      highRisk: rows.filter((row) => String(row.risk_level).toLowerCase() === 'high').length,
      medicationIssues: rows.map((row) => row.medication_issue),
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summary, null, 2),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

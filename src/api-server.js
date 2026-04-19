import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StateGraph, END } from '@langchain/langgraph';
import { loadPdfDocuments, loadDbDocuments } from './lib/loaders.js';
import { buildSparseIndex, retrieve } from './lib/retriever.js';
import { createChatModel } from './lib/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const pdfDir = path.join(ROOT, 'data', 'pdfs');
const dbPath = path.join(ROOT, 'data', 'sample.db');

const GraphState = {
  question: 'string',
  docs: 'array',
  answer: 'string',
};

async function buildApp() {
  const pdfDocs = await loadPdfDocuments(pdfDir);
  const dbDocs = loadDbDocuments(dbPath);
  const index = buildSparseIndex([...pdfDocs, ...dbDocs]);
  const model = createChatModel();

  const workflow = new StateGraph({ channels: GraphState });

  workflow.addNode('retrieve', async (state) => {
    const docs = retrieve(index, state.question, 4);
    return { docs };
  });

  workflow.addNode('answer', async (state) => {
    const context = state.docs
      .map((doc, i) => `[${i + 1}] (${doc.source})\n${doc.text.slice(0, 400)}`)
      .join('\n\n');

    const prompt = [
      '다음 근거만 사용해서 질문에 답하라.',
      '근거가 부족하면 부족하다고 말하라.',
      '',
      `질문: ${state.question}`,
      '',
      `근거:\n${context}`,
    ].join('\n');

    const response = await model.invoke(prompt);
    const answer = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    return { answer };
  });

  workflow.setEntryPoint('retrieve');
  workflow.addEdge('retrieve', 'answer');
  workflow.addEdge('answer', END);

  return workflow.compile();
}

function sendJson(res, status, payload) {
  const data = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

const app = await buildApp();

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && req.url === '/ask') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const question = parsed.question || '최근 고객 문의에서 반복되는 주제와 매출이 높은 고객 특징은?';
        const result = await app.invoke({ question });
        sendJson(res, 200, {
          question,
          answer: result.answer,
          docs: result.docs,
        });
      } catch (error) {
        sendJson(res, 500, { error: String(error) });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});

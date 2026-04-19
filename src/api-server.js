import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StateGraph, END } from '@langchain/langgraph';
import { loadPdfDocuments, loadDbDocuments } from './lib/loaders.js';
import { buildSparseIndex, retrieve } from './lib/retriever.js';
import { createChatModel } from './lib/model.js';
import { summarizeMedicalDocs } from './lib/medical-analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const pdfDir = path.join(ROOT, 'data', 'pdfs');
const dbPath = path.join(ROOT, 'data', 'sample.db');
const publicDir = path.join(ROOT, 'public');

const GraphState = {
  question: 'string',
  topK: 'number',
  provider: 'string',
  model: 'string',
  temperature: 'number',
  docs: 'array',
  answer: 'string',
};

async function buildIndex() {
  const pdfDocs = await loadPdfDocuments(pdfDir);
  const dbDocs = loadDbDocuments(dbPath);
  return buildSparseIndex([...pdfDocs, ...dbDocs]);
}

function sendJson(res, status, payload) {
  const data = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

const index = await buildIndex();

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const file = path.join(publicDir, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

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
        const question = parsed.question || '환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?';
        const topK = Number(parsed.topK || 4);
        const provider = parsed.provider || process.env.MODEL_PROVIDER || 'openai';
        const model = parsed.model || undefined;
        const temperature = typeof parsed.temperature === 'number'
          ? parsed.temperature
          : Number(parsed.temperature || process.env.TEMPERATURE || 0);

        const chatModel = createChatModel({ provider, model, temperature });

        const workflow = new StateGraph({ channels: GraphState });

        workflow.addNode('retrieve', async (state) => {
          const docs = retrieve(index, state.question, state.topK || 4);
          return { docs };
        });

        workflow.addNode('answer', async (state) => {
          const context = state.docs
            .map((doc, i) => `[${i + 1}] (${doc.source})\n${doc.text.slice(0, 400)}`)
            .join('\n\n');

          const summary = summarizeMedicalDocs(state.question, state.docs);

          const prompt = [
            '다음 의료 follow-up 근거와 관찰 요약만 사용해서 질문에 답하라.',
            '근거가 부족하면 부족하다고 말하라.',
            '',
            `질문: ${state.question}`,
            '',
            `관찰 요약:\n${summary}`,
            '',
            `근거:\n${context}`,
          ].join('\n');

          const response = await chatModel.invoke(prompt);
          const modelAnswer = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);

          const answer = `${summary}\n\n모델 응답:\n${modelAnswer}`;

          return { answer };
        });

        workflow.setEntryPoint('retrieve');
        workflow.addEdge('retrieve', 'answer');
        workflow.addEdge('answer', END);

        const app = workflow.compile();
        const result = await app.invoke({ question, topK, provider, model, temperature });

        sendJson(res, 200, {
          question,
          topK,
          provider,
          model: model || (provider === 'ollama' ? process.env.OLLAMA_MODEL : process.env.OPENAI_MODEL),
          temperature,
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

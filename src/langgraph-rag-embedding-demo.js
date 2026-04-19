import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StateGraph, END } from '@langchain/langgraph';

import { loadPdfDocuments, loadDbDocuments } from './lib/loaders.js';
import { createEmbeddings } from './lib/embeddings.js';
import { createChatModel } from './lib/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const pdfDir = path.join(ROOT, 'data', 'pdfs');
const dbPath = path.join(ROOT, 'data', 'sample.db');

const GraphState = {
  question: 'string',
  topK: 'number',
  docs: 'array',
  answer: 'string',
};

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function buildEmbeddingIndex() {
  const docs = [...await loadPdfDocuments(pdfDir), ...loadDbDocuments(dbPath)];
  const embeddings = createEmbeddings();
  const vectors = await embeddings.embedDocuments(docs.map((doc) => doc.text));
  return docs.map((doc, i) => ({ ...doc, vector: vectors[i] }));
}

async function main() {
  const index = await buildEmbeddingIndex();
  const model = createChatModel();
  const embeddings = createEmbeddings();

  const workflow = new StateGraph({ channels: GraphState });

  workflow.addNode('retrieve', async (state) => {
    const q = await embeddings.embedQuery(state.question);
    const docs = index
      .map((doc) => ({ ...doc, score: cosine(q, doc.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, state.topK || 4);
    return { docs };
  });

  workflow.addNode('answer', async (state) => {
    const context = state.docs
      .map((doc, i) => `[${i + 1}] (${doc.source})\n${doc.text.slice(0, 400)}`)
      .join('\n\n');

    const prompt = [
      '다음 의료 follow-up 근거만 사용해서 질문에 답하라.',
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

  const app = workflow.compile();
  const question = '당뇨와 고혈압 환자에서 공통적으로 보이는 관리 문제는 무엇인가?';
  const result = await app.invoke({ question, topK: 4 });

  console.log('\n=== EMBEDDING DEMO QUESTION ===\n');
  console.log(question);
  console.log('\n=== RETRIEVED DOCS ===\n');
  for (const doc of result.docs) {
    console.log(`- score=${doc.score.toFixed(4)} source=${doc.source}`);
  }
  console.log('\n=== ANSWER ===\n');
  console.log(result.answer);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

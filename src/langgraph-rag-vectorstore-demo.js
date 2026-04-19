import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StateGraph, END } from '@langchain/langgraph';

import { loadKnowledgeDocuments } from './lib/loaders.js';
import { buildChunkedVectorStore, searchChunkedVectorStore } from './lib/vector-store.js';
import { createChatModel } from './lib/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const sourceDir = path.join(ROOT, 'data');
const dbPath = path.join(ROOT, 'data', 'sample.db');

const GraphState = {
  question: 'string',
  topK: 'number',
  docs: 'array',
  answer: 'string',
};

async function main() {
  const provider = process.env.MODEL_PROVIDER || 'openai';
  const docs = await loadKnowledgeDocuments(sourceDir, dbPath);
  const { vectorStore, chunks } = await buildChunkedVectorStore(docs, { provider });
  const model = createChatModel({ provider });

  const workflow = new StateGraph({ channels: GraphState });

  workflow.addNode('retrieve', async (state) => {
    const retrieved = await searchChunkedVectorStore(vectorStore, state.question, state.topK || 4);
    return { docs: retrieved };
  });

  workflow.addNode('generateAnswer', async (state) => {
    const context = state.docs
      .map((doc, i) => `[${i + 1}] (${doc.source}#chunk-${doc.chunkIndex})\n${doc.text}`)
      .join('\n\n');

    const prompt = [
      '다음 chunk 근거만 사용해서 질문에 답하라.',
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
  workflow.addEdge('retrieve', 'generateAnswer');
  workflow.addEdge('generateAnswer', END);

  const app = workflow.compile();
  const question = '복약 순응도와 추적 관찰 지연이 함께 나타나는 패턴은 무엇인가?';
  const result = await app.invoke({ question, topK: 4 });

  console.log('\n=== VECTOR STORE DEMO ===\n');
  console.log(`provider=${provider}`);
  console.log(`loaded_docs=${docs.length}`);
  console.log(`chunk_count=${chunks.length}`);
  console.log('\n=== QUESTION ===\n');
  console.log(question);
  console.log('\n=== RETRIEVED CHUNKS ===\n');
  for (const doc of result.docs) {
    console.log(`- score=${doc.score.toFixed(4)} source=${doc.source} chunk=${doc.chunkIndex} chars=${doc.chunkChars}`);
  }
  console.log('\n=== ANSWER ===\n');
  console.log(result.answer);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

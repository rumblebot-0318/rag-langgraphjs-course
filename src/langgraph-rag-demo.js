import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StateGraph, END } from '@langchain/langgraph';

import { loadPdfDocuments, loadDbDocuments } from './lib/loaders.js';
import { buildSparseIndex, retrieve } from './lib/retriever.js';
import { createChatModel } from './lib/model.js';

// ESM 환경에서는 __dirname 이 바로 없어서 fileURLToPath로 현재 파일 위치를 계산한다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// 강의에서는 PDF와 DB를 둘 다 하나의 지식 베이스로 합친다는 점이 중요하다.
const pdfDir = path.join(ROOT, 'data', 'pdfs');
const dbPath = path.join(ROOT, 'data', 'sample.db');

// 1) 먼저 로컬 데이터 소스를 모두 읽는다.
// 2) 그 결과를 하나의 배열로 합친다.
// 3) 가장 단순한 sparse index를 만든다.
// 실제 서비스라면 여기를 벡터스토어/임베딩 기반으로 바꿀 수 있다.
async function loadKnowledgeBase() {
  const pdfDocs = await loadPdfDocuments(pdfDir);
  const dbDocs = loadDbDocuments(dbPath);
  return buildSparseIndex([...pdfDocs, ...dbDocs]);
}

// LangGraph에서 사용할 상태(state)의 모양을 채널 개념으로 적어둔다.
// 수업에서는 "질문이 들어오고, 검색 결과가 쌓이고, 마지막에 답이 채워진다"고 설명하면 이해가 쉽다.
const GraphState = {
  question: 'string',
  docs: 'array',
  answer: 'string',
};

async function main() {
  // 수업 포인트: 그래프가 돌기 전에 필요한 외부 자원(지식베이스, 모델)을 준비한다.
  const index = await loadKnowledgeBase();
  const model = createChatModel();

  // StateGraph를 만들고 노드를 붙인다.
  const workflow = new StateGraph({ channels: GraphState });

  // retrieve 노드:
  // 질문을 받아서 관련 문서를 찾는다.
  // 여기서는 아주 단순한 sparse 검색기지만,
  // 나중에 벡터DB, reranker, hybrid search로 확장할 수 있다.
  workflow.addNode('retrieve', async (state) => {
    const docs = retrieve(index, state.question, 4);
    return { docs };
  });

  // answer 노드:
  // retrieve 단계에서 찾은 문서를 컨텍스트로 묶고,
  // 실제 LLM(OpenAI 또는 Ollama)에게 답변을 생성하게 한다.
  workflow.addNode('answer', async (state) => {
    const context = state.docs
      .map((doc, i) => `[${i + 1}] (${doc.source})\n${doc.text.slice(0, 400)}`)
      .join('\n\n');

    // 프롬프트도 교육용으로 최대한 단순하게 유지했다.
    // 핵심 메시지: "근거만 사용해서 답하라"
    const prompt = [
      '다음 근거만 사용해서 질문에 답하라.',
      '근거가 부족하면 부족하다고 말하라.',
      '',
      `질문: ${state.question}`,
      '',
      `근거:\n${context}`,
    ].join('\n');

    const response = await model.invoke(prompt);

    // 모델 응답 포맷은 공급자마다 다를 수 있으므로 문자열로 정리한다.
    const answer = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    return { answer };
  });

  // 그래프 시작점과 종료 경로를 연결한다.
  workflow.setEntryPoint('retrieve');
  workflow.addEdge('retrieve', 'answer');
  workflow.addEdge('answer', END);

  // compile() 하면 실행 가능한 앱 객체가 된다.
  const app = workflow.compile();

  // 실제 질문 예시
  const question = '최근 고객 문의에서 반복되는 주제와 매출이 높은 고객 특징은?';

  // invoke() 는 state를 입력으로 받아 그래프를 실행한다.
  const result = await app.invoke({ question });

  console.log('\n=== QUESTION ===\n');
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

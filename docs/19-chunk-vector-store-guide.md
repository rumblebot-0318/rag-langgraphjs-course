# 19. Chunk + Vector Store 가이드

이 문서는 텍스트를 chunk 단위로 나누고, 임베딩한 뒤 vector store에 저장해서 검색하는 흐름을 설명한다.

## 왜 chunk로 나누는가?

문서 전체를 한 번에 임베딩하면 문맥이 너무 넓어서 검색 정밀도가 떨어질 수 있다.

예:
- 한 환자 노트 안에 복약 이슈, 진단, 추적 관찰 일정이 모두 들어 있다
- 질문은 그중에서도 `복약 순응도 저하`만 찾고 싶을 수 있다

이럴 때 문서를 적당한 길이의 chunk로 나누면 더 관련성 높은 조각을 찾기 쉬워진다.

## 이 레포의 예시 흐름

파일:
- `src/lib/vector-store.js`
- `src/langgraph-rag-vectorstore-demo.js`

실행:

```bash
npm run rag:demo:vector
```

## 동작 순서

1. 텍스트 샘플 문서와 DB 문서를 읽는다
2. 문서를 `Document` 형태로 바꾼다
3. `RecursiveCharacterTextSplitter`로 chunk를 만든다
4. 각 chunk를 임베딩 벡터로 바꾼다
5. `MemoryVectorStore`에 저장한다
6. 질문도 임베딩해서 유사한 chunk를 찾는다
7. 찾은 chunk를 근거로 답변을 생성한다

## 이 프로젝트에서 쓰는 구성

- splitter: `RecursiveCharacterTextSplitter`
- embeddings:
  - OpenAI: `text-embedding-3-small`
  - Ollama: `nomic-embed-text`
- vector store: `MemoryVectorStore`

여기서는 학습용으로 메모리 기반 vector store를 쓴다.
즉, 프로세스가 살아 있는 동안만 유지되는 간단한 vector DB 예시라고 보면 된다.

## 예시 코드 핵심

```js
const chunks = await splitter.splitDocuments(documents);
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
const results = await vectorStore.similaritySearchWithScore(question, 4);
```

핵심 포인트:
- 검색 대상이 문서 전체가 아니라 chunk다
- 각 chunk는 `source`, `type`, `chunkIndex` 메타데이터를 가진다
- retrieval 결과를 그대로 answer 단계의 근거로 쓸 수 있다

## API에서 사용하기

`/ask` 요청에 아래처럼 `retrievalMode`를 넣으면 된다.

```json
{
  "question": "복약 순응도와 추적 관찰 지연이 함께 나타나는 패턴은 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.2
}
```

터미널에서 바로 시험할 때는 아래 `curl`을 쓰면 된다.

```bash
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "복약 순응도와 추적 관찰 지연이 함께 나타나는 패턴은 무엇인가?",
    "topK": 4,
    "retrievalMode": "vector_chunks",
    "provider": "ollama",
    "model": "qwen2.5:3b",
    "embedModel": "nomic-embed-text",
    "temperature": 0.2
  }'
```

이 요청은 다음을 같이 검증한다.
- 텍스트가 chunk 단위로 분할돼 vector store에 들어갔는지
- 질문 임베딩과 chunk 임베딩 유사도 검색이 되는지
- 검색된 chunk가 `docs` 배열로 내려오는지
- 그 chunk들을 근거로 답변이 생성되는지

## sparse 검색과 비교

### sparse
- 단어 겹침 중심
- 구현이 단순하다
- 입문 설명에 좋다

### vector_chunks
- 의미 유사도 중심
- 긴 문서를 잘게 나눠 더 정밀하게 찾을 수 있다
- 같은 문서 안에서도 질문과 가까운 부분만 골라낼 수 있다

## 운영 관점 메모

현재 예시는 `MemoryVectorStore`라서 재시작하면 인덱스가 사라진다.
실무에서는 다음 같은 외부 vector DB로 바꾸는 경우가 많다.

- Chroma
- Weaviate
- Milvus
- pgvector

하지만 학습 단계에서는 메모리 기반 예제가 구조를 이해하기 가장 쉽다.

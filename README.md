# RAG LangGraph.js Course Starter

LangGraph.js 기반으로 RAG를 설명하고 실습할 수 있게 만든 **신규 강의용 레포**입니다.

핵심 목표:
- LangGraph.js로 RAG 흐름 이해하기
- PDF + DB(SQLite) 데이터를 함께 다루기
- Ollama / OpenAI(GPT) 두 가지 모델 경로 모두 설명하기
- 교보재처럼 구조와 원리를 문서화하기

## 포함 내용

- LangGraph.js 개념 설명
- OpenAI API 키 발급 가이드
- Ollama 설치 및 모델 사용 가이드
- PDF/DB RAG 구조 설명
- 강의용 슬라이드 초안
- JS 프로젝트 구조 예시

## 추천 대상

- RAG를 처음 배우는 사람
- LangGraph.js로 워크플로를 짜보고 싶은 사람
- Ollama와 GPT를 둘 다 비교해서 설명해야 하는 사람

## 빠른 시작

```bash
cd rag-langgraphjs-course
npm install
```

## 강의 자료

- `docs/01-rag-basics.md`
- `docs/02-openai-api-guide.md`
- `docs/03-ollama-guide.md`
- `docs/04-langgraphjs-guide.md`
- `docs/05-pdf-db-rag-guide.md`
- `docs/06-implementation-notes.md`
- `docs/08-langgraphjs-code-walkthrough.md`
- `docs/09-embeddings-guide.md`
- `docs/10-embedding-models.md`
- `docs/11-sparse-vs-embedding.md`
- `slides/lecture-outline.md`

## 예제 코드

- `src/langgraph-rag-demo.js`
- `src/lib/loaders.js`
- `src/lib/retriever.js`
- `src/lib/model.js`
- `src/lib/embeddings.js`
- `scripts/create-sample-db.js`

실행 예시:

```bash
npm install
npm run db:sample
npm run rag:demo
```

## 샘플 데이터

- `data/sample.db` : 샘플 SQLite DB
- `data/sample-report.pdf` : 강의용 샘플 PDF
- `data/sample-report.md` : PDF 원문에 해당하는 markdown 버전
- `data/sample-report.txt` : PDF에 들어간 내용 참고본

강의할 때는 이 샘플 파일로 바로 retrieval 흐름을 보여준 뒤,
실제 업무 PDF와 DB로 교체하는 식으로 진행하면 된다.

참고로 일부 GitHub/PDF 렌더러에서 PDF 미리보기가 불안정할 수 있으니,
수업에서는 `sample-report.md`를 함께 보여주는 것을 추천한다.

## 레포 목적

이 레포는 당장 완성품 앱보다, **수업/설명/입문 실습**에 초점을 둔다.
문서를 처음 읽는 사람이 헷갈리지 않도록 개념 설명을 쉬운 말로 풀어두는 방향을 우선했다.
필요하면 이걸 바탕으로 실제 앱 구현 레포로 확장하면 된다.

## 모델 전환 방식

`.env`에서 공급자를 바꿔서 설명할 수 있다.

### OpenAI 예시

```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
```

### Ollama 예시

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
```

# RAG LangGraph.js Course Starter

LangGraph.js 기반으로 RAG를 설명하고 실습할 수 있게 만든 **입문용 레포**입니다.

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
- 슬라이드 초안
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

## 바로 샘플 실행하기

아래 순서대로 하면 샘플 DB와 샘플 PDF를 기준으로 바로 흐름을 볼 수 있다.

### 1. 프로젝트 폴더로 이동

```bash
cd /data/data/com.termux/files/home/.openclaw/workspace/rag-langgraphjs-course
```

### 2. 패키지 설치

```bash
npm install
```

설치되는 주요 패키지:
- `@langchain/langgraph`
- `@langchain/openai`
- `@langchain/ollama`
- `better-sqlite3`
- `pdf-parse`
- `dotenv`

### 3. 환경변수 파일 준비

`.env.example`을 복사해서 `.env`를 만든다.

```bash
cp .env.example .env
```

### 4-A. OpenAI로 실행할 경우

`.env`를 열어서 아래처럼 맞춘다.

```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
```

### 4-B. Ollama로 실행할 경우

먼저 Ollama 서버와 모델이 준비되어 있어야 한다.

예시:

```bash
ollama serve
ollama pull qwen2.5:3b
ollama pull nomic-embed-text
```

그 다음 `.env`를 아래처럼 맞춘다.

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
```

### 5. 샘플 DB 생성

레포에는 이미 `data/sample.db`가 들어있지만, 다시 만들고 싶다면 아래를 실행한다.

```bash
npm run db:sample
```

### 6. 샘플 실행

```bash
npm run rag:demo
```

실행하면 대략 이런 흐름으로 동작한다.
- `data/sample-report.pdf` 읽기
- `data/sample.db` 읽기
- PDF와 DB row를 하나의 검색 대상으로 합치기
- 질문과 관련된 문서 찾기
- LangGraph.js 그래프로 `retrieve -> answer` 실행
- OpenAI 또는 Ollama 모델로 최종 답변 생성

이 과정을 더 자세히 보고 싶으면 아래 문서를 보면 된다.
- `docs/12-how-rag-pipeline-is-built.md`

### 7. API 서버로 실행

```bash
npm run rag:api
```

기본 포트는 `3000`이다.

#### health check

```bash
curl http://127.0.0.1:3000/health
```

#### 질문 보내기

```bash
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
    "topK": 4,
    "provider": "ollama",
    "model": "qwen2.5:3b",
    "temperature": 0.2
  }'
```

#### 브라우저로 보기

서버를 띄운 뒤 아래 주소로 들어가면 간단한 테스트 페이지도 볼 수 있다.

```text
http://127.0.0.1:3000/
```

응답에는 다음이 들어간다.
- 질문
- topK
- provider
- model
- temperature
- 생성된 답변
- retrieval된 문서 목록

#### 응답 예시

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "temperature": 0.2,
  "answer": "반복적으로 보이는 위험 신호는 복약 순응도 저하, 추적 관찰 지연, 만성질환 중복 관리 필요성이다.",
  "docs": [
    {
      "source": "db://patient_notes/0",
      "score": 0.42,
      "text": "환자명: Kim Minseo ..."
    }
  ]
}
```

### 8. 만약 바로 실행이 안 되면

#### `better-sqlite3` 설치 오류
환경에 따라 네이티브 빌드 이슈가 날 수 있다.
이 경우:
- Node 버전 확인
- 빌드 도구 확인
- 또는 `data/sample.db`를 그대로 읽는 경로만 먼저 설명

#### Ollama 연결 실패
- `ollama serve`가 켜져 있는지 확인
- `OLLAMA_BASE_URL`이 맞는지 확인
- 모델을 미리 `pull` 했는지 확인

#### OpenAI 인증 실패
- `OPENAI_API_KEY`가 올바른지 확인
- 결제/사용량 제한이 걸려 있지 않은지 확인

## API 확인 포인트

API 모드에서는 아래를 확인하면 된다.
- `/health`가 정상 응답하는가
- `/ask`에 질문을 보내면 JSON이 오는가
- 응답에 `answer`, `docs`, `provider`, `model`, `temperature`가 들어있는가
- `topK` 값을 바꿨을 때 retrieval 결과 수가 달라지는가

## 확인 포인트

샘플 실행에서 꼭 확인할 것은 세 가지다.
- 어떤 문서가 retrieval 되었는가
- PDF와 DB가 함께 검색 대상에 들어갔는가
- 최종 답변이 근거를 바탕으로 생성되었는가

## 문서 구성

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
- `docs/12-how-rag-pipeline-is-built.md`

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

- `data/sample.db` : 의료 환자 추적 관찰 샘플 SQLite DB
- `data/sample-report.pdf` : 의료 운영 요약 샘플 PDF
- `data/sample-report.md` : PDF 원문에 해당하는 markdown 버전
- `data/sample-report.txt` : PDF에 들어간 내용 참고본

강의할 때는 이 샘플 파일로 바로 retrieval 흐름을 보여준 뒤,
실제 업무 PDF와 DB로 교체하는 식으로 진행하면 된다.

참고로 일부 GitHub/PDF 렌더러에서 PDF 미리보기가 불안정할 수 있으니,
PDF 미리보기가 불안정한 환경에서는 `sample-report.md`를 함께 보는 편이 안전하다.

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

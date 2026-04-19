# RAG LangGraph.js Course Starter

LangGraph.js 기반으로 RAG를 설명하고 실습할 수 있게 만든 **입문용 레포**입니다.

핵심 목표:
- LangGraph.js로 RAG 흐름 이해하기
- 문서 파일 + DB(SQLite) 데이터를 함께 다루기
- Ollama / OpenAI(GPT) 두 가지 모델 경로 모두 설명하기
- 교보재처럼 구조와 원리를 문서화하기

## 포함 내용

- LangGraph.js 개념 설명
- OpenAI API 키 발급 가이드
- Ollama 설치 및 모델 사용 가이드
- 문서 파일/DB RAG 구조 설명
- 슬라이드 초안
- JS 프로젝트 구조 예시

## 추천 대상

- RAG를 처음 배우는 사람
- LangGraph.js로 워크플로를 짜보고 싶은 사람
- Ollama와 GPT를 둘 다 비교해서 설명해야 하는 사람
- Nodejs 버전은 21버전 이후를 권장

## 권장 작업 방식

이 프로젝트는 **Codex 앱으로 같이 작업하면서 RAG를 만드는 흐름**을 특히 권장한다.

이유는 단순하다.
- 같은 워크스페이스에서 코드 수정, 문서 정리, Docker 실행, `curl` 테스트를 한 번에 이어서 진행하기 쉽다
- `rag:demo`, `rag:demo:vector`, `rag:api` 같은 실행 경로를 바로 확인하고 수정 루프를 짧게 가져가기 좋다
- Ollama, SQLite, chunk retrieval, API 응답 예시를 문서와 코드 기준으로 같이 맞춰 나가기 편하다

처음부터 크게 만들기보다 아래 순서가 가장 안정적이다.
1. `sample-report.txt`와 `sample.db`로 최소 동작 확인
2. `vector_chunks`와 `nomic-embed-text`까지 붙여 retrieval 품질 확인
3. Docker와 `curl /ask`로 재현 가능한 실행 경로 정리
4. 그 뒤 실제 업무 문서와 DB로 교체

관련 가이드는 `docs/20-codex-app-rag-guide.md`에 정리해두었다.

## 빠른 시작

```bash
cd rag-langgraphjs-course
npm install
```

### Node 버전 안내

이 프로젝트는 로컬 실행 기준으로 `Node 18 LTS` 또는 `Node 20 LTS`를 권장한다.

- `Node 16`에서는 일부 ESM 패키지 해석 문제로 바로 실행이 안 될 수 있다.
- `Node 21+`에서는 `better-sqlite3`가 환경에 따라 prebuilt binary를 못 찾아 소스 빌드로 넘어갈 수 있다.
- macOS에서 소스 빌드로 넘어가면 `Xcode Command Line Tools`가 필요할 수 있다.
- Docker 실행 경로는 `node:20-bookworm-slim` 이미지를 쓰므로 로컬 Node 환경 차이를 덜 탄다.

## 바로 샘플 실행하기

아래 순서대로 하면 샘플 DB와 샘플 TXT 문서를 기준으로 바로 흐름을 볼 수 있다.

### 1. 프로젝트 폴더로 이동

```bash
cd /rag-langgraphjs-course
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
- `data/sample-report.txt` 읽기
- `data/sample.db` 읽기
- 텍스트 문서와 DB row를 하나의 검색 대상으로 합치기
- 질문과 관련된 문서 찾기
- 의료 follow-up 관찰 요약 생성
- LangGraph.js 그래프로 `retrieve -> generateAnswer` 실행
- OpenAI 또는 Ollama 모델로 최종 답변 생성

임베딩 버전은 아래 명령으로 실행할 수 있다.

```bash
npm run rag:demo:embed
```

텍스트를 chunk로 나누고 vector store에 저장한 뒤 검색하는 버전은 아래 명령으로 실행할 수 있다.

```bash
npm run rag:demo:vector
```

이 과정을 더 자세히 보고 싶으면 아래 문서를 보면 된다.
- `docs/12-how-rag-pipeline-is-built.md`
- `docs/19-chunk-vector-store-guide.md`

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
    "retrievalMode": "vector_chunks",
    "provider": "ollama",
    "model": "qwen2.5:3b",
    "embedModel": "nomic-embed-text",
    "temperature": 0.2
  }'
```

위 `curl` 예시는 아래를 한 번에 확인하는 가장 빠른 샘플이다.
- API 서버가 `POST /ask`를 정상 처리하는지
- `Ollama`의 `qwen2.5:3b` 호출이 되는지
- `nomic-embed-text`로 chunk 임베딩과 `vector_chunks` retrieval이 동작하는지
- 최종 JSON에 `answer`와 `docs`가 함께 내려오는지

응답을 볼 때는 다음 필드를 먼저 확인하면 된다.
- `retrievalMode`: 실제로 `vector_chunks` 경로를 탔는지
- `embedModel`: 어떤 임베딩 모델을 썼는지
- `answer`: 최종 생성 답변
- `docs`: 검색된 chunk 목록과 `chunkIndex`, `score`

#### 브라우저로 보기

서버를 띄운 뒤 아래 주소로 들어가면 간단한 테스트 페이지도 볼 수 있다.

```text
http://127.0.0.1:3000/
```

응답에는 다음이 들어간다.
- 질문
- topK
- retrievalMode
- provider
- model
- embedModel
- temperature
- 생성된 답변
- retrieval된 문서 목록

#### 응답 예시

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
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

#### Ollama 실제 실행 예시

아래는 `qwen2.5:3b`로 실제 확인한 응답 형태 예시다.

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.2,
  "answer": "질문: 환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?\n\n의료 관찰 요약:\n- 복약 순응도 저하 또는 복약 관리 문제 신호가 반복적으로 보인다.\n- 추적 관찰 지연이 반복되는 위험 요소로 나타난다.\n- 만성질환 환자에서 지속적 모니터링 필요성이 높게 나타난다.\n- 고위험군 환자에 대한 우선 추적 관찰 필요성이 보인다.\n\n모델 응답:\n환자 추적 관찰에서 반복되는 위험 신호는 복약 순응도 저하, 추적 관찰 지연, 고위험군 우선 관리 필요성으로 요약할 수 있다.",
  "docs": [
    {
      "source": "db://patient_notes/0",
      "score": 0.0756,
      "chunkIndex": 0,
      "text": "환자명: Choi Yuna ..."
    },
    {
      "source": "db://patient_notes/2",
      "score": 0.0714,
      "chunkIndex": 0,
      "text": "환자명: Lee Jihun ..."
    }
  ]
}
```

즉, 위 `curl` 샘플은 단순 health check가 아니라 "chunk 검색 -> 근거 문서 반환 -> Ollama 답변 생성"까지 끝까지 연결되는지 확인하는 요청이다.

참고:
- 첫 요청은 Ollama가 모델을 메모리에 올리느라 더 오래 걸릴 수 있다.
- 샘플 실행은 `sample-report.txt`를 기본 문서 소스로 사용한다.
- 같은 basename의 파일이 여러 개 있으면 로더는 `.txt -> .md -> .pdf` 순으로 우선 선택한다.
- PDF 파일만 있는 경우에는 기존처럼 PDF 파싱도 가능하다.

### 8. 만약 바로 실행이 안 되면

#### `better-sqlite3` 설치 오류
환경에 따라 네이티브 빌드 이슈가 날 수 있다.
이 경우:
- Node 버전을 `21 LTS`로 맞추기
- 빌드 도구 확인
- 또는 `data/sample.db`를 그대로 읽는 경로만 먼저 설명

#### Ollama 연결 실패
- `ollama serve`가 켜져 있는지 확인
- `OLLAMA_BASE_URL`이 맞는지 확인
- 모델을 미리 `pull` 했는지 확인

#### OpenAI 인증 실패
- `OPENAI_API_KEY`가 올바른지 확인
- 결제/사용량 제한이 걸려 있지 않은지 확인

### 8. MCP 서버 실행

```bash
npm run mcp:server
```

MCP 예시 서버는 `sample.db`를 읽어서 patient note 조회용 tool을 제공한다.

### 9. Docker로 바로 띄우기

```bash
cp .env.example .env
docker compose up --build
```

Docker에서 Ollama까지 함께 띄우려면 `.env`를 아래처럼 맞추는 것이 가장 단순하다.

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
PORT=3000
```

더 자세한 내용은 아래 문서를 보면 된다.
- `docs/16-docker-quickstart.md`

## 의료 질문 예시

의료 샘플 질문은 아래 문서에 모아두었다.
- `docs/17-medical-question-examples.md`

## API 확인 포인트

API 모드에서는 아래를 확인하면 된다.
- `/health`가 정상 응답하는가
- `/ask`에 질문을 보내면 JSON이 오는가
- 응답에 `answer`, `docs`, `provider`, `retrievalMode`, `model`, `embedModel`, `temperature`가 들어있는가
- `topK` 값을 바꿨을 때 retrieval 결과 수가 달라지는가
- `retrievalMode`를 `sparse`와 `vector_chunks`로 바꿨을 때 retrieval 결과가 달라지는가

## 확인 포인트

샘플 실행에서 꼭 확인할 것은 세 가지다.
- 어떤 문서가 retrieval 되었는가
- 텍스트 문서와 DB가 함께 검색 대상에 들어갔는가
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
- `docs/13-api-usage.md`
- `docs/14-mcp-server-guide.md`
- `docs/15-how-to-build-an-mcp-server.md`
- `docs/16-docker-quickstart.md`
- `docs/17-medical-question-examples.md`
- `docs/18-embedding-medical-demo.md`
- `docs/19-chunk-vector-store-guide.md`
- `docs/20-codex-app-rag-guide.md`

## 예제 코드

- `src/langgraph-rag-demo.js`
- `src/api-server.js`
- `src/lib/loaders.js`
- `src/lib/retriever.js`
- `src/lib/model.js`
- `src/lib/embeddings.js`
- `src/lib/medical-analysis.js`
- `src/langgraph-rag-embedding-demo.js`
- `src/langgraph-rag-vectorstore-demo.js`
- `scripts/create-sample-db.js`
- `mcp/patient-mcp-server.js`

실행 예시:

```bash
npm install
npm run db:sample
npm run rag:demo
npm run rag:demo:embed
npm run rag:demo:vector
```

## 샘플 데이터

- `data/sample.db` : 의료 환자 추적 관찰 샘플 SQLite DB
- `data/sample-report.txt` : 기본 의료 운영 요약 샘플 텍스트
- `data/sample-report.md` : 같은 내용을 markdown으로 정리한 버전
- `data/sample-report.pdf` : 선택적으로 PDF 파싱을 시험할 때 쓰는 보조 파일

강의할 때는 이 샘플 파일로 바로 retrieval 흐름을 보여준 뒤,
실제 업무용 txt/md/pdf 문서와 DB로 교체하는 식으로 진행하면 된다.

참고로 기본 샘플은 `sample-report.txt`지만,
PDF 파싱 경로를 따로 시험하고 싶다면 `sample-report.pdf`도 보조 예제로 남겨두었다.

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

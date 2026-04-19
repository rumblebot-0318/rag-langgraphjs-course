# 16. Docker로 바로 띄우기

이 프로젝트는 Docker로도 바로 실행할 수 있다.

## Node 버전 참고

- Docker 이미지는 `node:20-bookworm-slim`을 사용한다.
- 로컬에서 직접 `npm install` 할 때는 `Node 18 LTS` 또는 `Node 20 LTS`를 권장한다.
- `Node 21+`에서는 `better-sqlite3`가 prebuilt binary를 못 찾으면 빌드 도구가 필요할 수 있다.

## 1. .env 준비

```bash
cp .env.example .env
```

필요한 값:

### OpenAI 사용 시

```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
PORT=3000
```

### Ollama 사용 시

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
PORT=3000
```

## 2. 이미지 빌드

```bash
docker build -t rag-langgraphjs-course .
```

## 3. 컨테이너 실행

```bash
docker run --rm -p 3000:3000 --env-file .env rag-langgraphjs-course
```

## 4. 확인

### health check

```bash
curl http://127.0.0.1:3000/health
```

### 질문 보내기

```bash
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
    "topK": 4,
    "provider": "openai",
    "model": "gpt-4.1-mini",
    "temperature": 0.2
  }'
```

이 `curl`은 컨테이너 위에서 다음이 모두 연결되는지 확인하는 샘플이다.
- `rag-api` 컨테이너가 `POST /ask`를 처리하는지
- 모델 호출이 정상적으로 되는지
- 검색 결과와 최종 답변이 하나의 JSON으로 반환되는지

### 브라우저 테스트

- `http://127.0.0.1:3000/`

## 5. docker compose 사용

compose 파일에는 `ollama` 서비스도 포함되어 있으므로,
Ollama까지 함께 띄우려면 `.env`를 아래처럼 맞춘다.

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBED_MODEL=nomic-embed-text
PORT=3000
```

```bash
docker compose up --build
```

모델이 아직 없으면 아래처럼 한 번 받아두면 된다.

```bash
docker exec rag-langgraphjs-ollama ollama pull qwen2.5:3b
```

chunk 기반 vector retrieval까지 같이 확인하려면 임베딩 모델도 받아두면 된다.

```bash
docker exec rag-langgraphjs-ollama ollama pull nomic-embed-text
```

그리고 아래처럼 `retrievalMode`와 `embedModel`을 포함한 `curl`을 보내면 된다.

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

이 샘플은 "도커에서 API가 뜬다" 수준이 아니라, "chunk 임베딩 생성 -> vector 검색 -> Ollama 답변"까지 끝까지 성공하는지 확인하는 요청이다.

샘플 요청 응답 예시:

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.2,
  "answer": "질문: ...\n\n의료 관찰 요약:\n- 복약 순응도 저하 또는 복약 관리 문제 신호가 반복적으로 보인다.\n- 추적 관찰 지연이 반복되는 위험 요소로 나타난다.\n\n모델 응답:\n환자 추적 관찰에서 반복되는 위험 신호는 복약 순응도 저하, 추적 관찰 지연, 고위험군 우선 관리 필요성으로 요약할 수 있다.",
  "docs": [
    {
      "source": "db://patient_notes/0",
      "score": 0.0756,
      "chunkIndex": 0,
      "text": "환자명: Choi Yuna ..."
    }
  ]
}
```

응답에서는 `answer`만 보지 말고 `docs`, `chunkIndex`, `score`도 함께 확인하면 retrieval이 실제로 동작했는지 판단하기 쉽다.

## 참고

- Ollama를 도커 밖에서 돌리고 있으면 `host.docker.internal` 경로를 쓸 수 있다.
- 리눅스 환경에서는 host gateway 설정이 추가로 필요할 수 있다.
- 첫 Ollama 요청은 모델 로딩 때문에 조금 느릴 수 있다.
- OpenAI 경로가 가장 단순하고, Ollama 경로는 로컬 환경 차이를 더 탈 수 있다.

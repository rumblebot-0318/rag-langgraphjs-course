# 16. Docker로 바로 띄우기

이 프로젝트는 Docker로도 바로 실행할 수 있다.

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

### 브라우저 테스트

- `http://127.0.0.1:3000/`

## 5. docker compose 사용

```bash
docker compose up --build
```

## 참고

- Ollama를 도커 밖에서 돌리고 있으면 `host.docker.internal` 경로를 쓸 수 있다.
- 리눅스 환경에서는 host gateway 설정이 추가로 필요할 수 있다.
- OpenAI 경로가 가장 단순하고, Ollama 경로는 로컬 환경 차이를 더 탈 수 있다.

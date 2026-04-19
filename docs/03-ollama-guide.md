# 03. Ollama 가이드

## Ollama란?

Ollama는 로컬에서 LLM을 쉽게 실행하게 해주는 도구다.
강의에서는 "클라우드 API를 쓰지 않고도 로컬 모델을 붙일 수 있다"는 점을 설명하기 좋다.

## 기본 개념

- OpenAI: 클라우드 API 호출
- Ollama: 로컬 또는 사설 서버에서 모델 실행

## 설치 후 예시

```bash
ollama serve
ollama pull qwen2.5:3b
ollama run qwen2.5:3b
```

## 환경변수 예시

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

## curl로 직접 호출해보기

Ollama는 HTTP API를 열어두기 때문에 `curl`로도 바로 호출해볼 수 있다.

### generate API 예시

```bash
curl http://127.0.0.1:11434/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5:3b",
    "prompt": "RAG가 무엇인지 3문장으로 설명해줘",
    "stream": false
  }'
```

### chat API 예시

```bash
curl http://127.0.0.1:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5:3b",
    "messages": [
      {"role": "user", "content": "LangGraph.js가 무엇인지 쉽게 설명해줘"}
    ],
    "stream": false
  }'
```

### 임베딩 모델 확인 예시

```bash
curl http://127.0.0.1:11434/api/embed \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nomic-embed-text",
    "input": "pricing, deployment time, support scope"
  }'
```

이 예시들은 LangChain이나 LangGraph.js를 붙이기 전에,
Ollama 서버와 모델이 정상 동작하는지 확인할 때 유용하다.

## 정리

- 로컬 모델은 개인정보/내부 데이터 실습에 유리할 수 있다
- 대신 품질, 속도, 메모리 요구량은 모델마다 차이가 크다
- 처음에는 작은 모델부터 시작하는 편이 안정적이다

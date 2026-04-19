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

## 정리

- 로컬 모델은 개인정보/내부 데이터 실습에 유리할 수 있다
- 대신 품질, 속도, 메모리 요구량은 모델마다 차이가 크다
- 처음에는 작은 모델부터 시작하는 편이 안정적이다

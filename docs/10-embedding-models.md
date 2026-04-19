# 10. 샘플 임베딩 모델 가이드

## 강의용으로 설명하기 좋은 모델들

### 1. OpenAI 임베딩
- 예시: `text-embedding-3-small`
- 장점:
  - 품질이 안정적
  - OpenAI API와 함께 설명하기 쉬움
  - 빠르게 시작 가능
- 단점:
  - 유료 API
  - 외부 호출 필요

강의 추천도: 매우 높음

### 2. Ollama / 로컬 임베딩 모델
- 예시: `nomic-embed-text`
- 장점:
  - 로컬 실행 가능
  - 내부 데이터 실습에 유리
  - OpenAI 없이도 임베딩 개념 설명 가능
- 단점:
  - 환경 세팅 필요
  - 하드웨어 영향 큼

강의 추천도: 매우 높음

### 3. Hugging Face / sentence-transformers 계열
- 예시:
  - `sentence-transformers/all-MiniLM-L6-v2`
  - `BAAI/bge-small-en-v1.5`
- 장점:
  - 입문용 자료가 많음
  - 작은 모델은 가볍게 돌릴 수 있음
- 단점:
  - JS 환경에서는 바로 붙이기보다 Python 예제가 더 흔함

강의 추천도: 중간 이상

## 실습 추천 조합

### OpenAI 기반 실습
- 생성 모델: `gpt-4.1-mini`
- 임베딩 모델: `text-embedding-3-small`

### 로컬 기반 실습
- 생성 모델: `qwen2.5:3b`
- 임베딩 모델: `nomic-embed-text`

## 한 줄 정리

- 생성 모델은 답을 만들고, 임베딩 모델은 찾기를 잘하게 만든다

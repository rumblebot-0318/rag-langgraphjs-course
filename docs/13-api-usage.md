# 13. API로 응답 받기

이 프로젝트는 데모 스크립트뿐 아니라 HTTP API 방식으로도 실행할 수 있다.

## 실행

```bash
npm run rag:api
```

기본 주소:
- `http://127.0.0.1:3000`

## 엔드포인트

### GET /
간단한 웹 테스트 페이지를 반환한다.

### GET /health
서버가 살아 있는지 확인한다.

예시:

```bash
curl http://127.0.0.1:3000/health
```

예상 응답:

```json
{
  "ok": true
}
```

### POST /ask
질문을 보내고 RAG 결과를 받는다.

보낼 수 있는 필드:
- `question`: 질문 문자열
- `topK`: 몇 개 문서를 가져올지
- `retrievalMode`: `sparse` 또는 `vector_chunks`
- `provider`: `openai` 또는 `ollama`
- `model`: 사용할 생성 모델 이름
- `embedModel`: 사용할 임베딩 모델 이름
- `temperature`: 생성 온도

예시:

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

이 `curl` 샘플은 아래 항목을 한 번에 점검하는 용도다.
- API 서버가 `POST /ask`를 받는지
- `provider=ollama` 설정이 적용되는지
- `retrievalMode=vector_chunks`로 chunk 기반 검색이 실행되는지
- `embedModel=nomic-embed-text`가 실제 임베딩에 사용되는지
- 응답 JSON에 `answer`와 `docs`가 모두 포함되는지

응답을 읽을 때는 다음 필드를 먼저 보면 된다.
- `answer`: 최종 생성 답변
- `docs`: 검색된 근거 chunk 목록
- `retrievalMode`: 검색 방식 확인
- `embedModel`: 사용한 임베딩 모델 확인
- `chunkIndex`: 문서가 어느 chunk에서 검색됐는지 확인

예상 응답 구조:

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.2,
  "answer": "...",
  "docs": [
    {
      "source": "db://patient_notes/0",
      "score": 0.42,
      "text": "..."
    }
  ]
}
```

실제 Ollama 실행 예시:

```json
{
  "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
  "topK": 4,
  "retrievalMode": "vector_chunks",
  "provider": "ollama",
  "model": "qwen2.5:3b",
  "embedModel": "nomic-embed-text",
  "temperature": 0.2,
  "answer": "질문: ...\n\n의료 관찰 요약:\n- 복약 순응도 저하 또는 복약 관리 문제 신호가 반복적으로 보인다.\n- 추적 관찰 지연이 반복되는 위험 요소로 나타난다.\n\n모델 응답:\n환자 추적 관찰에서 반복되는 위험 신호는 복약 순응도 저하와 추적 관찰 지연이다.",
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

샘플 요청을 그대로 실행했을 때 위와 비슷한 JSON이 오면, 현재 환경에서 Ollama 생성과 chunk retrieval이 함께 정상 동작한다고 보면 된다.

## 파라미터 설명

### topK
retrieval 단계에서 상위 몇 개 문서를 사용할지 결정한다.
- 너무 작으면 근거가 부족할 수 있다
- 너무 크면 잡음이 늘 수 있다
- 시작값으로는 `3~5` 정도가 무난하다

### temperature
생성 답변의 다양성을 조절한다.
- `0`에 가까우면 더 안정적이고 보수적인 답변
- 높아질수록 표현이 다양해질 수 있음
- 분석형/근거형 응답에서는 보통 낮게 두는 편이 낫다

### provider
어떤 모델 공급자를 쓸지 정한다.
- `openai`
- `ollama`

### retrievalMode
어떤 검색 방식을 쓸지 정한다.
- `sparse`: 단어 겹침 기반 검색
- `vector_chunks`: chunk + vector store 기반 검색

### model
실제로 사용할 생성 모델 이름이다.
예:
- `gpt-4.1-mini`
- `qwen2.5:3b`

### embedModel
임베딩 생성에 사용할 모델 이름이다.
예:
- `text-embedding-3-small`
- `nomic-embed-text`

## 예시 응답

질문:
- 환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?

예시 응답 요약:
- 복약 순응도 저하
- 추적 관찰 지연
- 당뇨/고혈압 같은 만성질환의 중복 관리 필요
- 고위험군 환자에서 재방문 누락 위험 증가

응답은 단순 LLM 문장만 주는 것이 아니라,
의료 follow-up 관찰 요약과 모델 응답이 함께 들어가도록 확장할 수 있다.

## 내부 동작

- 요청에서 `question`, `topK`, `provider`, `retrievalMode`, `model`, `embedModel`, `temperature`를 받는다
- `retrievalMode=vector_chunks`면 문서를 chunk로 나눠 vector store에서 찾는다
- LangGraph.js 그래프를 실행한다
- retrieve 노드가 문서를 찾는다
- generateAnswer 노드가 답변을 만든다
- JSON으로 결과를 돌려준다

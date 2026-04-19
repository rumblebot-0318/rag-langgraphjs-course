# 13. API로 응답 받기

이 프로젝트는 데모 스크립트뿐 아니라 HTTP API 방식으로도 실행할 수 있다.

## 실행

```bash
npm run rag:api
```

기본 주소:
- `http://127.0.0.1:3000`

## 엔드포인트

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

예시:

```bash
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "최근 고객 문의에서 반복되는 주제와 매출이 높은 고객 특징은?"
  }'
```

예상 응답 구조:

```json
{
  "question": "최근 고객 문의에서 반복되는 주제와 매출이 높은 고객 특징은?",
  "answer": "...",
  "docs": [
    {
      "source": "...",
      "score": 0.42,
      "text": "..."
    }
  ]
}
```

## 내부 동작

- 요청에서 `question`을 받는다
- LangGraph.js 그래프를 실행한다
- retrieve 노드가 문서를 찾는다
- answer 노드가 답변을 만든다
- JSON으로 결과를 돌려준다

## 왜 API가 useful한가?

API 형태로 만들어두면 다음 확장이 쉬워진다.
- 웹 프론트엔드 연결
- 챗 UI 연결
- 다른 서비스와 연동
- 테스트 자동화

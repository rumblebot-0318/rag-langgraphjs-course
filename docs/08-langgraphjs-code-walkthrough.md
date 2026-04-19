# 08. LangGraph.js 코드 워크스루

## 예제 파일

- `src/langgraph-rag-demo.js`

## 이 예제가 보여주는 것

1. PDF와 DB에서 문서를 읽는다
2. sample.db 와 sample PDF를 이용해 바로 실습할 수 있다
3. 간단한 sparse retriever를 만든다
4. LangGraph.js로 retrieve → answer 흐름을 만든다
5. 모델 공급자를 OpenAI 또는 Ollama로 바꿔서 같은 그래프를 실행한다

## 왜 교육용으로 좋은가?

- 구조가 단순하다
- 상태가 어떻게 이동하는지 보인다
- 공급자 분리 방식도 같이 설명할 수 있다
- 나중에 rerank, retry, branch를 추가하기 쉽다

## 수업 포인트

- 첫 수업에서는 retrieval과 answer 두 노드만 보여줘도 충분하다
- 그다음 analyze, route, retry 노드를 추가하며 확장 설명을 하면 좋다
- OpenAI와 Ollama 차이는 그래프가 아니라 model provider 계층에서 처리한다

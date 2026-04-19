# 08. LangGraph.js 코드 워크스루

## 예제 파일

- `src/langgraph-rag-demo.js`

## 이 예제가 보여주는 것

1. 문서 파일과 DB에서 문서를 읽는다
2. `sample.db` 와 `sample-report.txt`를 이용해 바로 실습할 수 있다
3. 간단한 sparse retriever를 만든다
4. LangGraph.js로 retrieve → answer 흐름을 만든다
5. 필요하면 임베딩 모델 계층을 추가해 semantic search로 확장할 수 있다
6. 모델 공급자를 OpenAI 또는 Ollama로 바꿔서 같은 그래프를 실행한다

## 왜 보기 쉬운가?

- 구조가 단순하다
- 상태가 어떻게 이동하는지 보인다
- 공급자 분리 방식도 함께 볼 수 있다
- 나중에 rerank, retry, branch를 추가하기 쉽다
- 참고한 `langgraph-js` 예제처럼 node 단위로 읽을 수 있다

## 참고한 레포에서 가져온 핵심 포인트

### RAGStudy에서 참고한 점
- RAG를 loader -> splitter -> retriever -> answer 흐름으로 설명하는 방식
- 입문자에게 "정석 RAG"를 보여주기 좋은 구조

### langgraph-js에서 참고한 점
- StateGraph 중심 설명
- 상태 기반 흐름과 node 연결 설명
- LangGraph.js를 교보재로 설명하기 좋은 코드 스타일

## 읽을 때 볼 점

- 처음에는 retrieval과 answer 두 노드만 봐도 전체 흐름이 보인다
- 그다음 analyze, route, retry 노드를 추가하며 확장할 수 있다
- OpenAI와 Ollama 차이는 그래프가 아니라 model provider 계층에서 처리한다

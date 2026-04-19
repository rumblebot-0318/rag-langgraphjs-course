# 04. LangGraph.js 가이드

## LangGraph.js란?

LangGraph.js는 LLM 애플리케이션의 흐름을 **그래프 구조**로 표현하게 도와주는 라이브러리다.

즉, 단순히 함수 하나를 호출하는 게 아니라:
- 상태(state)를 들고
- 단계(node)를 거치고
- 조건(edge)으로 다음 경로를 정하고
- 필요하면 반복도 가능하게 만든다

## 왜 RAG에 잘 맞는가?

RAG는 생각보다 단계가 많다.

예:
1. 질문 받기
2. 질문 정리
3. 검색 수행
4. 검색 결과 검토
5. 답변 생성
6. 종료

복잡한 경우에는:
- 검색 결과가 부족하면 재검색
- 특정 질문이면 DB 우선 검색
- 실패하면 fallback 모델 사용

이런 흐름을 LangGraph.js로 표현하면 구조가 훨씬 명확해진다.

## 수업용 설명 포인트

- 함수 체인보다 상태 기반 워크플로에 가깝다
- 에이전트 시스템, 고급 RAG, tool-calling 흐름에 유리하다
- 처음엔 없어도 되지만, 커질수록 필요해진다

## 강의용 예시 그래프

- input node
- retrieve node
- analyze node
- answer node
- end

참고한 `langgraph-js` 레포처럼,
LangGraph.js는 단순 linear chain보다 state와 node를 명시적으로 보여주기 좋다.
강의에서는 "상태가 노드를 거치며 어떻게 바뀌는가"를 강조하면 이해가 훨씬 쉬워진다.

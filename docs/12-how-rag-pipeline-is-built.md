# 12. 데모에서 RAG 파이프라인이 만들어지는 과정

이 문서는 `src/langgraph-rag-demo.js` 기준으로,
데모가 실제로 어떤 순서로 동작하는지 설명한다.

## 한눈에 보기

데모는 크게 6단계로 나뉜다.

1. 데이터 준비
2. 문서 로드
3. 검색 인덱스 준비
4. LangGraph.js 그래프 구성
5. 질문 실행
6. 답변 생성

## 1. 데이터 준비

데모는 두 종류의 데이터를 사용한다.

- 문서 파일
- SQLite DB row

이 프로젝트에서는:
- `data/sample-report.txt`
- `data/sample.db`
를 사용한다.

핵심은 서로 다른 형식의 데이터를
**하나의 검색 가능한 문서 집합**으로 바꾸는 것이다.

## 2. 문서 로드

`src/lib/loaders.js`에서 두 작업을 한다.

### 문서 파일 로드
- 기본 샘플에서는 TXT 파일을 읽는다
- 필요하면 같은 로더로 PDF도 읽을 수 있다
- 공백을 정리한다
- 문서 객체로 만든다

### DB 로드
- SQLite에서 row를 읽는다
- 각 row를 텍스트로 바꾼다
- row 하나를 하나의 문서처럼 다룬다

즉, 이 단계가 끝나면
문서 파일과 DB row가 모두 비슷한 형태의 문서 배열이 된다.

## 3. 검색 인덱스 준비

`src/lib/retriever.js`에서 아주 단순한 sparse 검색기를 만든다.

과정은 이렇다.
- 문서를 토큰화한다
- 각 문서의 term frequency를 만든다
- 질문도 같은 방식으로 변환한다
- 질문과 문서의 유사도를 계산한다

이 단계의 목적은
"질문과 관련 있는 문서를 먼저 추려내는 것"이다.

## 4. LangGraph.js 그래프 구성

`src/langgraph-rag-demo.js`에서 그래프를 만든다.

여기서 state는 대략 이렇게 생각하면 된다.
- `question`: 사용자 질문
- `docs`: 검색된 문서
- `answer`: 최종 답변

노드는 두 개다.

### retrieve 노드
- 질문을 입력으로 받는다
- 관련 문서를 찾는다
- `docs`를 state에 채운다

### answer 노드
- 검색된 문서를 근거로 prompt를 만든다
- 모델을 호출한다
- `answer`를 state에 채운다

즉, 이 데모는 가장 작은 형태의 RAG 그래프다.

## 5. 질문 실행

그래프를 만들고 나면 `invoke()`로 실행한다.

예시 질문:
- 최근 고객 문의에서 반복되는 주제와 매출이 높은 고객 특징은?

이 질문이 state에 들어가고,
retrieve -> answer 순서로 그래프가 실행된다.

## 6. 답변 생성

answer 노드에서는 검색된 문서를 prompt에 넣고,
OpenAI 또는 Ollama 모델을 호출한다.

이때 중요한 점은:
- 모델이 혼자 추측해서 답하는 게 아니라
- 검색된 문서를 근거로 답하도록 만드는 것이다.

## 왜 이 순서가 중요한가?

이 구조를 이해하면 다음 확장이 쉬워진다.

- sparse 검색 -> embedding 검색
- 단일 retrieve -> rerank 추가
- 단순 answer -> analyze 노드 추가
- 한 번 실행 -> 조건 분기 / retry 추가

즉, 지금 데모는 단순하지만,
실제 RAG 시스템의 뼈대와 연결되는 출발점이다.

## 코드와 연결해서 보기

- 데이터 로딩: `src/lib/loaders.js`
- 검색: `src/lib/retriever.js`
- 모델 선택: `src/lib/model.js`
- 그래프 실행: `src/langgraph-rag-demo.js`

## 한 줄 정리

이 데모의 핵심은:
**문서 파일과 DB를 하나의 지식 집합으로 묶고, LangGraph.js로 retrieve -> answer 흐름을 만든다**는 점이다.

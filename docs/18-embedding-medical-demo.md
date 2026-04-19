# 18. 의료 도메인 임베딩 데모 연결

이 문서는 의료 환자 데이터 샘플에 임베딩 검색을 연결하는 흐름을 설명한다.

## 왜 의료 도메인에서 임베딩이 중요한가?

의료 문서는 같은 뜻을 여러 방식으로 표현하는 경우가 많다.
예:
- medication adherence
- missed dose
- irregular medication use
- 복약 순응도 저하

단순 키워드 검색만으로는 이런 표현 차이를 충분히 잡지 못할 수 있다.
그래서 의료 follow-up, 상담 기록, 요약 노트 같은 문서에서는 임베딩 검색이 특히 유용하다.

## 이 레포의 임베딩 데모

- 파일: `src/langgraph-rag-embedding-demo.js`
- 실행: `npm run rag:demo:embed`

chunk + vector store 기반 예시는 아래를 보면 된다.
- 파일: `src/langgraph-rag-vectorstore-demo.js`
- 실행: `npm run rag:demo:vector`

## 동작 방식

1. 텍스트 샘플 문서와 DB 문서를 읽는다
2. 각 문서를 임베딩 벡터로 바꾼다
3. 질문도 임베딩 벡터로 바꾼다
4. cosine similarity로 상위 문서를 찾는다
5. 찾은 문서를 근거로 모델이 답한다

## chunk + vector store 버전은 무엇이 다른가?

기존 임베딩 데모는 문서 단위 임베딩 후 직접 cosine similarity를 계산한다.

vector store 버전은:
1. 문서를 chunk로 나눈다
2. chunk를 vector store에 저장한다
3. 질문으로 chunk 검색을 수행한다
4. 검색된 chunk를 answer 단계에 전달한다

즉, 더 실무적인 구조는 `rag:demo:vector` 쪽에 가깝다.

## 추천 임베딩 모델

### OpenAI
- `text-embedding-3-small`

### Ollama
- `nomic-embed-text`

## 같이 비교해보기 좋은 질문

- 당뇨와 고혈압 환자에서 공통적으로 보이는 관리 문제는 무엇인가?
- 추적 관찰이 지연된 환자에서 반복되는 위험 신호는 무엇인가?
- 복약 이슈와 위험도가 함께 높게 나타나는 패턴이 있는가?

## 비교 포인트

- sparse 검색과 임베딩 검색의 retrieval 결과가 어떻게 다른가
- 어떤 표현 차이를 더 잘 잡는가
- 의료 요약 응답의 품질이 어떻게 달라지는가

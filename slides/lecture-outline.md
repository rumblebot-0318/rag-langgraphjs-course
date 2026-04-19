# LangGraph.js RAG 강의 PPT 초안

## 슬라이드 1. 제목
- LangGraph.js로 배우는 RAG 입문
- PDF와 DB를 함께 다루는 검색 기반 AI

## 슬라이드 2. 오늘 배울 것
- RAG의 기본 원리
- PDF + DB를 함께 읽는 이유
- OpenAI GPT와 Ollama 비교
- LangGraph.js의 역할
- 강의용 실습 레포 구조

## 슬라이드 3. RAG란?
- Retrieval-Augmented Generation
- 먼저 찾고, 그다음 답하기
- 외부 지식을 활용한 답변 구조

## 슬라이드 4. 왜 필요한가?
- 최신 정보 반영
- 사내 문서 활용
- 근거 기반 응답
- 환각 감소 기대

## 슬라이드 5. 데이터 소스
- PDF: 보고서, 계약서, 매뉴얼
- DB: 고객, 매출, 문의 이력

## 슬라이드 6. PDF + DB를 같이 써야 하는 이유
- 실무 데이터는 여러 형식이 섞여 있음
- 문서와 DB를 묶어야 실제적인 분석 가능

## 슬라이드 7. LangGraph.js란?
- 상태 기반 워크플로
- 노드와 엣지로 흐름 관리
- 복잡한 RAG에 적합

## 슬라이드 8. 기본 그래프 예시
- input
- retrieve
- analyze
- answer
- end

## 슬라이드 9. OpenAI GPT 경로
- 장점: 빠른 시작, 높은 편의성
- 단점: 비용, 외부 의존

## 슬라이드 10. Ollama 경로
- 장점: 로컬 실행, 데이터 통제
- 단점: 자원 제약, 품질 편차

## 슬라이드 11. API 키 발급
- OpenAI 플랫폼 로그인
- API key 생성
- 환경변수 저장
- 코드에 하드코딩 금지

## 슬라이드 12. 환경변수 설계
- MODEL_PROVIDER=openai | ollama
- OPENAI_API_KEY
- OPENAI_MODEL
- OPENAI_EMBED_MODEL
- OLLAMA_BASE_URL
- OLLAMA_MODEL
- OLLAMA_EMBED_MODEL

## 슬라이드 13. 구현 구조
- loaders
- chunking
- retrieval
- graph
- answer generation

## 슬라이드 14. 검색 방식 비교
- sparse 검색: 단어 겹침 중심
- embedding 검색: 의미 유사도 중심
- 수업에서는 둘을 비교해서 보여주면 이해가 쉬움

## 슬라이드 15. 왜 임베딩을 쓰는가?
- 비슷한 뜻의 표현을 더 잘 찾기 위해
- 검색 품질을 높이기 위해
- 최종 답변 품질을 안정화하기 위해

## 슬라이드 16. 강의용 레포 설명
- docs 중심
- 입문용 구성
- 이후 실제 앱으로 확장 가능

## 슬라이드 17. 확장 방향
- vector DB
- reranker
- 더 나은 parser
- 실제 UI/API 서버

## 슬라이드 18. 마무리
- 좋은 RAG는 좋은 검색에서 시작한다
- LangGraph.js는 복잡한 흐름을 다루기 좋다
- OpenAI와 Ollama는 상황에 따라 선택하면 된다

# 05. PDF + DB RAG 가이드

## 왜 PDF와 DB를 같이 다루는가?

실무 데이터는 대개 한 종류가 아니다.

- PDF: 제안서, 보고서, 계약서, 매뉴얼
- DB: 고객 정보, 매출, 문의 이력, 상태값

둘을 같이 읽을 수 있어야 더 실무적인 RAG가 된다.

## 기본 구조

1. PDF에서 텍스트 추출
2. DB에서 row를 읽어 텍스트로 변환
3. 둘을 하나의 문서 컬렉션으로 통합
4. chunking
5. retrieval
6. model answer

이 흐름은 참고한 `RAGStudy` 레포의 정석 구조와도 맞닿아 있다.
즉, loader -> splitter -> embeddings/retriever -> answer 생성 흐름을 먼저 이해하면 된다.

## 핵심 메시지

- DB도 결국 검색 가능한 텍스트 문서로 바꿔 쓸 수 있다
- PDF는 비정형, DB는 정형 데이터다
- RAG는 서로 다른 소스를 하나의 지식 기반으로 묶는 기술이다

## 보완 메모

현재 레포의 기본 샘플은 `sample-report.txt`다.
같은 내용의 `sample-report.md`도 참고용으로 두고, `sample-report.pdf`는 선택적으로 PDF 파싱을 시험할 때만 쓰는 보조 파일로 남겨둔다.

## OpenAI / Ollama 비교 설명

### OpenAI 경로
- 장점: 품질, 편의성, 빠른 시작
- 단점: 비용, 외부 API 의존

### Ollama 경로
- 장점: 로컬 실행, 내부 데이터 통제
- 단점: 하드웨어 제약, 모델 품질 편차

두 경로를 함께 보면 상황에 따라 어떤 선택이 맞는지 비교하기 쉽다.

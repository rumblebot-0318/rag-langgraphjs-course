# 15. MCP 서버 만드는 법

이 문서는 아주 작은 MCP 서버를 직접 만드는 흐름을 설명한다.

## 1. 무엇을 도구로 노출할지 정한다

예:
- 환자 기록 조회
- 고위험군 환자 수 계산
- 최근 follow-up 지연 건 조회

핵심은 "LLM이 호출하면 유용한 기능"을 고르는 것이다.

## 2. 입력과 출력을 정한다

예를 들어 `list_patient_notes` 도구라면:
- 입력: `limit`, `riskLevel`
- 출력: 환자 기록 목록

입력이 너무 많으면 복잡해지고,
출력이 너무 불분명하면 모델이 활용하기 어려워진다.

## 3. 실제 데이터 소스와 연결한다

이 레포에서는 `sample.db`를 읽는다.
즉:
- SQLite 연결
- SQL 실행
- 결과를 JSON 또는 텍스트로 정리

## 4. MCP 서버에 tool을 등록한다

예제 코드에서는 `server.tool(...)` 형태로 등록한다.

각 tool에는 보통 이런 정보가 들어간다.
- 이름
- 설명
- 입력 스키마
- 실제 실행 함수

## 5. transport를 선택한다

가장 단순한 방식은 stdio다.
이 방식은 로컬 개발과 실습에 좋다.

- `StdioServerTransport`

## 6. 클라이언트에서 연결한다

MCP 서버를 만들었다고 끝이 아니다.
그 다음에는:
- MCP 클라이언트
- LangGraph.js tool layer
- 또는 다른 MCP 지원 도구
에서 실제로 연결해야 한다.

## 아주 짧은 구조 요약

1. 서버 만들기
2. tool 등록하기
3. DB/파일/외부 API 연결하기
4. transport 붙이기
5. 클라이언트에서 호출하기

## 이 레포에서 같이 보면 좋은 파일

- `mcp/patient-mcp-server.js`
- `data/sample.db`
- `docs/14-mcp-server-guide.md`

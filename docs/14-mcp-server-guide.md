# 14. MCP 서버 가이드

## MCP란?

MCP(Model Context Protocol)는 모델이 외부 도구나 데이터 소스와 더 표준적인 방식으로 연결되도록 돕는 프로토콜이다.

쉽게 말하면:
- LLM이 혼자 답하는 것이 아니라
- 외부 도구를 호출하고
- 그 결과를 받아서
- 더 정확한 작업을 하게 만드는 연결 규칙이다.

## 이 레포에서 MCP를 왜 붙이는가?

이 프로젝트는 원래 PDF + DB + LangGraph.js + API 흐름을 설명한다.
여기에 MCP를 추가하면 다음도 설명할 수 있다.

- DB를 MCP 도구로 노출하기
- 모델이 MCP 서버를 통해 patient_notes를 조회하기
- LangGraph.js와 외부 도구 연결 개념 이해하기

## 포함된 예시 서버

- `mcp/patient-mcp-server.js`

이 서버는 sample.db를 읽어서 두 개의 도구를 제공한다.

### 1. `list_patient_notes`
- 환자 추적 관찰 기록 목록 조회
- `limit`
- `riskLevel`
옵션 사용 가능

### 2. `summarize_risk_patterns`
- 고위험군 수
- 추적 지연 수
- 복약 이슈 목록
같은 요약 결과 반환

## 실행 개념

이 예시는 stdio 기반 MCP 서버다.
즉, 로컬에서 프로세스를 실행하고 표준 입출력으로 모델/클라이언트와 통신한다.

## 어떤 상황에 useful한가?

- 로컬 DB를 안전하게 도구처럼 노출하고 싶을 때
- 단순 REST API보다 "모델 친화적인 도구 인터페이스"가 필요할 때
- LangGraph.js와 tool 사용 구조를 함께 설명하고 싶을 때

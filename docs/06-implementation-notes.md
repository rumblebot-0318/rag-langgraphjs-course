# 06. 구현 노트

## 권장 프로젝트 흐름

### Step 1. 데이터 로딩
- PDF 로드
- DB 조회
- 텍스트 정규화

### Step 2. 문서 분할
- chunk size 정하기
- overlap 설정
- 메타데이터 보존

### Step 3. 검색기 연결
- 처음에는 간단한 검색기로 시작
- 이후 vector DB로 교체 가능

### Step 4. LangGraph.js로 파이프라인 구성
- state 정의
- retrieve node
- analyze node
- answer node

### Step 5. 모델 공급자 분리
- OpenAI provider
- Ollama provider
- 환경변수로 분기

## 강의용 포인트

- 구현은 작게 시작하고 구조는 크게 설명한다
- 처음부터 모든 고급 기능을 넣지 않는다
- provider abstraction을 보여주면 수강생이 훨씬 잘 이해한다

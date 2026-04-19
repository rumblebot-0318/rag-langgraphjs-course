# 20. Codex 앱으로 RAG 만들기 가이드

## 왜 Codex 앱을 권장하나?

이 레포는 문서 읽기, 코드 수정, Docker 실행, `curl` 테스트, 샘플 데이터 정리가 자주 반복된다.
이런 작업은 Codex 앱에서 한 흐름으로 묶어 진행할 때 가장 편하다.

특히 아래 같은 점이 잘 맞는다.

- 같은 워크스페이스에서 코드와 문서를 함께 수정할 수 있다
- `docker compose up --build`, `npm run rag:demo:vector`, `curl /ask` 같은 검증 루프를 바로 이어서 실행하기 쉽다
- 수정 이유와 테스트 결과를 같은 대화 안에 남길 수 있다
- 샘플 txt 문서, SQLite, Ollama, vector retrieval처럼 여러 요소가 얽힌 작업을 단계적으로 정리하기 좋다

즉, 이 프로젝트는 "코드만 작성"하는 작업보다
"RAG 흐름을 같이 만들고 검증하는 작업"에 가깝고,
그 점에서 Codex 앱 사용성이 특히 좋다.

## 이 레포에서 추천하는 진행 순서

### 1. 가장 작은 샘플부터 맞추기

먼저 아래 두 파일이 기본 샘플 소스다.

- `data/sample-report.txt`
- `data/sample.db`

처음에는 이 두 개만 기준으로 생각하면 된다.
즉, 텍스트 문서 하나와 DB row 몇 개를 함께 검색 대상으로 삼는 가장 작은 RAG를 먼저 맞춘다.

### 2. sparse RAG 먼저 확인

가장 먼저 확인할 명령은 아래다.

```bash
npm install
npm run rag:demo
```

여기서는 다음만 보면 된다.

- 문서와 DB가 같이 로드되는지
- 질문과 관련된 문서가 검색되는지
- 최종 답변이 근거 기반으로 생성되는지

### 3. chunk + vector retrieval로 확장

그 다음은 chunk 기반 retrieval로 넘어간다.

```bash
npm run rag:demo:vector
```

이 단계에서는 아래를 확인한다.

- 긴 텍스트가 chunk로 나뉘는지
- `MemoryVectorStore`에 chunk가 들어가는지
- 질문과 가까운 chunk가 retrieval 되는지

Ollama 기준으로는 보통 아래 조합이 가장 설명하기 쉽다.

- 생성 모델: `qwen2.5:3b`
- 임베딩 모델: `nomic-embed-text`

## Codex 앱에서 잘 맞는 작업 루프

이 레포는 아래 루프로 작업하는 것을 권장한다.

1. 문서 또는 샘플 데이터 수정
2. 코드 수정
3. Docker 또는 npm 실행
4. `curl`로 API 응답 확인
5. 응답 예시와 문서 내용 동기화

예를 들어, sample 문서를 바꿨다면 아래처럼 바로 검증하면 된다.

```bash
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "복약 순응도와 추적 관찰 지연이 함께 나타나는 패턴은 무엇인가?",
    "topK": 4,
    "retrievalMode": "vector_chunks",
    "provider": "ollama",
    "model": "qwen2.5:3b",
    "embedModel": "nomic-embed-text",
    "temperature": 0.2
  }'
```

이 요청에서 확인할 핵심은 아래다.

- `docs`에 `sample-report.txt`와 `db://patient_notes/...`가 같이 들어오는지
- `retrievalMode`가 `vector_chunks`인지
- `embedModel`이 의도한 값인지
- 답변이 검색된 근거와 어긋나지 않는지

## 왜 Docker 경로도 같이 쓰는가?

로컬 Node 버전이나 `better-sqlite3` 빌드 상태에 따라 실행 차이가 날 수 있다.
그래서 Codex 앱에서 작업할 때도 최종 확인은 Docker 경로를 같이 보는 편이 안정적이다.

권장 확인 순서는 아래다.

```bash
docker compose up --build
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "환자 추적 관찰에서 반복되는 위험 신호는 무엇인가?",
    "topK": 4,
    "retrievalMode": "vector_chunks",
    "provider": "ollama",
    "model": "qwen2.5:3b",
    "embedModel": "nomic-embed-text",
    "temperature": 0.2
  }'
```

## Codex 앱으로 만들 때 좋은 점

### 문서와 코드가 같이 움직인다

RAG 프로젝트는 코드만 맞는다고 끝나지 않는다.
샘플 질문, 응답 예시, 모델 설명, 실행 방법 문서가 같이 맞아야 한다.
Codex 앱에서는 이걸 한 번에 정리하기 쉽다.

### 수정 후 바로 테스트하기 쉽다

예를 들어 loader 우선순위를 `.txt -> .md -> .pdf`로 바꾸면,
곧바로 Docker 재빌드와 `curl` 요청으로 실제 retrieval 결과를 확인할 수 있다.

### 설명용 프로젝트에 특히 잘 맞는다

이 레포는 완성형 제품보다 수업, 데모, 입문 실습에 가깝다.
그래서 "왜 이렇게 바꿨는지", "지금 어디까지 검증됐는지"를 함께 남기는 방식이 중요하다.
Codex 앱은 이런 협업식 흐름에 잘 맞는다.

## 추천 기준 한 줄 요약

이 프로젝트는 Codex 앱에서
**샘플 데이터 정리 -> 코드 수정 -> Docker 실행 -> `curl` 검증 -> 문서 업데이트**
순서로 진행하는 방식을 가장 권장한다.

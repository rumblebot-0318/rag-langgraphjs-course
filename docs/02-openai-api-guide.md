# 02. OpenAI GPT API 가이드

## API 키 발급 절차

1. OpenAI Platform에 로그인한다.
2. Billing 설정을 확인한다.
3. API Keys 메뉴로 이동한다.
4. 새 secret key를 생성한다.
5. 키를 복사해서 안전한 곳에 저장한다.

## 환경변수 설정

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4.1-mini"
```

또는 `.env` 파일:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
MODEL_PROVIDER=openai
```

## 강의 포인트

- API 키는 절대 코드에 하드코딩하지 않는다
- Git에 올리지 않는다
- 실습은 보통 소형/저비용 모델로 시작한다
- RAG에서는 검색과 생성 단계를 분리해서 설명하는 것이 좋다

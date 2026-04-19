# 07. 신규 Git 레포 파서 알려주기

새 레포 위치:

`/data/data/com.termux/files/home/.openclaw/workspace/rag-langgraphjs-course`

## 직접 GitHub에 올릴 때 기본 절차

```bash
cd /data/data/com.termux/files/home/.openclaw/workspace/rag-langgraphjs-course
git init
git add .
git commit -m "init: add rag langgraphjs course starter"
git branch -M main
git remote add origin <새_깃허브_레포_URL>
git push -u origin main
```

## 레포 설명 예시

- 이름: `rag-langgraphjs-course`
- 설명: `Lecture-friendly RAG starter with LangGraph.js, OpenAI GPT, Ollama, PDF, and DB concepts`

## 강의용으로 좋은 이유

- docs가 잘 분리되어 있음
- OpenAI/Ollama 비교 설명 가능
- LangGraph.js 개념 설명 자료 포함
- 수업 자료 + 실습 출발점 역할 가능

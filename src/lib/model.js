import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';

// 모델 공급자를 한 군데에서 분기하면,
// LangGraph 자체는 그대로 두고 OpenAI/Ollama만 바꿔 끼울 수 있다.
// 강의에서 이 구조를 보여주면 provider abstraction 개념 설명이 쉽다.
export function createChatModel() {
  const provider = process.env.MODEL_PROVIDER || 'openai';

  if (provider === 'ollama') {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
      temperature: 0,
    });
  }

  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    temperature: 0,
  });
}

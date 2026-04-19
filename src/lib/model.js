import { ChatOpenAI } from '@langchain/openai';
import { ChatOllama } from '@langchain/ollama';

export function createChatModel(options = {}) {
  const provider = options.provider || process.env.MODEL_PROVIDER || 'openai';
  const modelName = options.model;
  const temperature = typeof options.temperature === 'number'
    ? options.temperature
    : Number(process.env.TEMPERATURE || 0);

  if (provider === 'ollama') {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: modelName || process.env.OLLAMA_MODEL || 'qwen2.5:3b',
      temperature,
    });
  }

  return new ChatOpenAI({
    model: modelName || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    temperature,
  });
}

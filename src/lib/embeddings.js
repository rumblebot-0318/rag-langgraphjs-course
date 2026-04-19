import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from '@langchain/ollama';

// 강의용 임베딩 provider 분기 예제.
// 실제로는 검색기에서 이 객체를 사용해 문서/질문을 벡터로 바꾼다.
export function createEmbeddings(options = {}) {
  const provider = options.provider || process.env.MODEL_PROVIDER || 'openai';
  const embedModel = options.embedModel;

  if (provider === 'ollama') {
    return new OllamaEmbeddings({
      baseUrl: options.baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: embedModel || process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    });
  }

  return new OpenAIEmbeddings({
    model: embedModel || process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
  });
}

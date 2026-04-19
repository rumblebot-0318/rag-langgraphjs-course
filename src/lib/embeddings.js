import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from '@langchain/ollama';

// 강의용 임베딩 provider 분기 예제.
// 실제로는 검색기에서 이 객체를 사용해 문서/질문을 벡터로 바꾼다.
export function createEmbeddings() {
  const provider = process.env.MODEL_PROVIDER || 'openai';

  if (provider === 'ollama') {
    return new OllamaEmbeddings({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    });
  }

  return new OpenAIEmbeddings({
    model: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
  });
}

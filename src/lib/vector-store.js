import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { createEmbeddings } from './embeddings.js';

function toDocuments(docs) {
  return docs.map((doc) => new Document({
    pageContent: doc.text,
    metadata: {
      source: doc.source,
      type: doc.type,
    },
  }));
}

function withChunkMetadata(chunks) {
  const counts = new Map();

  return chunks.map((chunk) => {
    const source = chunk.metadata.source || 'unknown';
    const chunkIndex = counts.get(source) || 0;
    counts.set(source, chunkIndex + 1);

    chunk.metadata = {
      ...chunk.metadata,
      chunkIndex,
      chunkChars: chunk.pageContent.length,
    };

    return chunk;
  });
}

export async function splitDocumentsForVectorStore(
  docs,
  options = {},
) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize || 350,
    chunkOverlap: options.chunkOverlap || 80,
  });

  const chunks = await splitter.splitDocuments(toDocuments(docs));
  return withChunkMetadata(chunks);
}

export async function buildChunkedVectorStore(
  docs,
  options = {},
) {
  const chunks = await splitDocumentsForVectorStore(docs, options);
  const embeddings = createEmbeddings({
    provider: options.provider,
    baseUrl: options.baseUrl,
    embedModel: options.embedModel,
  });
  const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

  return {
    vectorStore,
    chunks,
  };
}

export async function searchChunkedVectorStore(
  vectorStore,
  question,
  topK = 4,
) {
  const matches = await vectorStore.similaritySearchWithScore(question, topK);

  return matches.map(([doc, score]) => ({
    source: doc.metadata.source,
    type: doc.metadata.type,
    text: doc.pageContent,
    score,
    chunkIndex: doc.metadata.chunkIndex,
    chunkChars: doc.metadata.chunkChars,
  }));
}

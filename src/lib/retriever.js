const TOKEN_REGEX = /[0-9A-Za-z가-힣_]+/g;
const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'and', 'in', '이', '그', '은', '는', '하다', '있다']);

// 텍스트를 간단한 토큰 집합으로 바꾼다.
// 입문 강의에서는 이 정도만으로도 retrieval 개념 설명이 충분하다.
function tokenize(text) {
  return (text.match(TOKEN_REGEX) || []).map((t) => t.toLowerCase()).filter((t) => !STOPWORDS.has(t));
}

// 단순 term frequency 계산
function termFreq(text) {
  const map = new Map();
  for (const token of tokenize(text)) {
    map.set(token, (map.get(token) || 0) + 1);
  }
  return map;
}

function norm(map) {
  let sum = 0;
  for (const value of map.values()) sum += value * value;
  return Math.sqrt(sum) || 1;
}

// 아주 기초적인 cosine 유사도.
// 실무에서는 이 자리에 embedding similarity가 들어가는 경우가 많다.
function cosine(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [key, value] of small.entries()) {
    dot += value * (large.get(key) || 0);
  }
  return dot / (norm(a) * norm(b));
}

// 문서 배열을 index로 변환한다.
export function buildSparseIndex(docs) {
  return docs.map((doc, idx) => ({
    id: idx,
    ...doc,
    tf: termFreq(doc.text),
  }));
}

// 질문과 유사한 문서를 점수화해서 상위 K개를 반환한다.
export function retrieve(index, query, topK = 4) {
  const q = termFreq(query);
  return index
    .map((doc) => {
      let score = cosine(q, doc.tf);
      if (doc.text.toLowerCase().includes(query.toLowerCase())) score += 0.15;
      return { ...doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

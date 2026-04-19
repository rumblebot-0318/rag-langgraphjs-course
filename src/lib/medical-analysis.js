export function summarizeMedicalDocs(question, docs) {
  if (!docs || docs.length === 0) {
    return '관련 근거를 찾지 못했습니다.';
  }

  const joined = docs.map((doc) => String(doc.text || '')).join('\n');
  const observations = [];

  if (/missed|inconsistent|irregular|복약|medication/i.test(joined)) {
    observations.push('복약 순응도 저하 또는 복약 관리 문제 신호가 반복적으로 보인다.');
  }

  if (/delayed|지연|follow-up delayed/i.test(joined)) {
    observations.push('추적 관찰 지연이 반복되는 위험 요소로 나타난다.');
  }

  if (/diabetes|hypertension|chronic kidney disease|당뇨|고혈압/i.test(joined)) {
    observations.push('만성질환 환자에서 지속적 모니터링 필요성이 높게 나타난다.');
  }

  if (/high/i.test(joined) || /위험도: high/i.test(joined)) {
    observations.push('고위험군 환자에 대한 우선 추적 관찰 필요성이 보인다.');
  }

  const lines = [
    `질문: ${question}`,
    '',
    '의료 관찰 요약:',
    ...observations.map((item) => `- ${item}`),
    '',
    '근거 문서:',
    ...docs.slice(0, 4).map((doc, i) => `- 근거 ${i + 1} (${doc.source}, score=${doc.score.toFixed(4)}): ${String(doc.text).slice(0, 220)}`),
  ];

  return lines.join('\n');
}

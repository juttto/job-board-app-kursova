/** Сторінка деталей вакансії (одна статична сторінка + query) — працює для Firestore ID на GitHub Pages. */
export function jobDetailHref(jobId) {
  return `/jobs/detail?id=${encodeURIComponent(String(jobId))}`;
}

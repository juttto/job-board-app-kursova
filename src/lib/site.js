/**
 * Шлях підпапки на GitHub Pages (має збігатися з `basePath` у `next.config.mjs`).
 * На клієнті береться з NEXT_PUBLIC_BASE_PATH; на білді Next підставляє env з next.config.
 */
export function getBasePath() {
  const p = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return p === "/" ? "" : p;
}

/** Повний URL до статичного JSON вакансій (у проді з basePath). */
export function getStaticJobsJsonUrl() {
  if (typeof window === "undefined") return "";
  const base = getBasePath();
  return `${window.location.origin}${base}/data/jobs.json`;
}

export function getDemoResumesJsonUrl() {
  if (typeof window === "undefined") return "";
  const base = getBasePath();
  return `${window.location.origin}${base}/data/demo-resumes.json`;
}

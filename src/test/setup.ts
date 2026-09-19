import "@testing-library/jest-dom/vitest";

// jsdom não implementa HTMLMediaElement.play/pause (lança "Not implemented"
// de forma síncrona e barulhenta no console) — `shared/sons.ts` já trata
// isso como um no-op silencioso em produção (autoplay pode falhar de
// verdade também), então nos testes só evitamos o log de erro repetido.
if (typeof window !== "undefined" && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
}

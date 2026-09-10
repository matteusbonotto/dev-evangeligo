/**
 * Tipos do domínio da Harpa Cristã (T-012, RF-10). Os dados (~640 hinos)
 * vivem em `public/data/harpa-crista.json` (fetch lazy, ver
 * `dataLoader.ts`), migrados do mesmo mirror de terceiros já usado pelo
 * legado (sem informação de licença própria — ver `IA/memory/decisions.md`
 * ADR-017 para a decisão de migrar mesmo assim, com aviso visível).
 */

/** Formato bruto de `public/data/harpa-crista.json`: objeto chaveado por número do hino (string). */
export type HarpaData = Record<string, HinoBruto>;

export interface HinoBruto {
  /** Formato "N - Título" (ex.: "1 - Chuvas de Graça"). */
  hino: string;
  /** Coro/refrão, quando existir. Pode conter `<br>` como quebra de linha. */
  coro?: string;
  /** Estrofes numeradas ("1", "2", ...), cada uma podendo conter `<br>`. */
  verses: Record<string, string>;
}

export interface Hino {
  numero: number;
  titulo: string;
  coro: string[] | null;
  estrofes: { numero: number; linhas: string[] }[];
}

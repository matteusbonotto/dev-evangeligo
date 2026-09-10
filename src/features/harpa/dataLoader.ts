import type { Hino, HarpaData, HinoBruto } from "./types";

/**
 * Carregador dos 640 hinos da Harpa Cristã (T-012). Igual estratégia da
 * Bíblia (`../bible/dataLoader.ts`): JSON fora do bundle, buscado sob
 * demanda e cacheado em memória.
 */
let cache: Promise<HarpaData> | null = null;

export function loadHarpaData(): Promise<HarpaData> {
  cache ??= fetch("/data/harpa-crista.json").then((response) => {
    if (!response.ok) {
      throw new Error("Não foi possível carregar a Harpa Cristã.");
    }
    return response.json() as Promise<HarpaData>;
  });
  return cache;
}

/** Exposto só para os testes reiniciarem o cache do módulo entre casos. */
export function _resetCacheParaTeste(): void {
  cache = null;
}

function dividirLinhas(texto: string): string[] {
  return texto
    .split(/<br\s*\/?>/i)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);
}

function extrairTitulo(hino: string): string {
  const separadorIndex = hino.indexOf(" - ");
  return separadorIndex >= 0 ? hino.slice(separadorIndex + 3) : hino;
}

/**
 * O JSON traz uma entrada de metadados do autor do mirror sob a chave
 * `"-1"` (sem `hino`/`verses`), misturada com os hinos de verdade —
 * filtrada aqui em vez de tratada como um hino inválido.
 */
function ehHinoValido(numero: number, valor: unknown): valor is HinoBruto {
  return (
    Number.isInteger(numero) &&
    numero > 0 &&
    typeof valor === "object" &&
    valor !== null &&
    typeof (valor as HinoBruto).hino === "string" &&
    typeof (valor as HinoBruto).verses === "object"
  );
}

/** Converte o formato bruto do JSON (`HinoBruto`) para a forma pronta para exibição (`Hino`). */
export function parseHino(numero: number, bruto: HinoBruto): Hino {
  const titulo = extrairTitulo(bruto.hino);

  const estrofes = Object.entries(bruto.verses)
    .map(([numeroEstrofe, texto]) => ({
      numero: Number(numeroEstrofe),
      linhas: dividirLinhas(texto),
    }))
    .sort((a, b) => a.numero - b.numero);

  return {
    numero,
    titulo,
    coro: bruto.coro ? dividirLinhas(bruto.coro) : null,
    estrofes,
  };
}

export interface HinoResumo {
  numero: number;
  titulo: string;
}

export async function listarHinos(): Promise<HinoResumo[]> {
  const data = await loadHarpaData();
  return Object.entries(data)
    .map(([numero, bruto]) => [Number(numero), bruto] as const)
    .filter(([numero, bruto]) => ehHinoValido(numero, bruto))
    .map(([numero, bruto]) => ({
      numero,
      titulo: extrairTitulo((bruto as HinoBruto).hino),
    }))
    .sort((a, b) => a.numero - b.numero);
}

export async function getHino(numero: number): Promise<Hino | undefined> {
  const data = await loadHarpaData();
  const bruto = data[String(numero)];
  return ehHinoValido(numero, bruto) ? parseHino(numero, bruto) : undefined;
}

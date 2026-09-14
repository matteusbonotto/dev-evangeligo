/**
 * Tier B de "quem fala" (T-042/ADR-036) — momentos icônicos onde uma
 * pessoa NOMEADA (que não é Jesus nem Deus Pai, já cobertos por
 * `falasEspeciais.ts`) fala em primeira pessoa no texto. Pedido explícito
 * do usuário: "quero uma forma de conseguir identificar [quem fala], e
 * ver também qual o versículo que posso confirmar isso" — ex. o próprio
 * exemplo dele, "Paulo escreveu que Jesus falou" (Atos 22/26, onde Paulo
 * narra em 1ª pessoa e as palavras de Jesus dentro do relato já são
 * marcadas por `falasEspeciais.ts` separadamente — as duas camadas
 * convivem sem conflito, cada uma respondendo uma pergunta diferente:
 * "quem fala" vs. "de que cor é a fala").
 *
 * MESMO formato de dados de `falasEspeciais.ts` (granularidade por
 * versículo inteiro), com um campo a mais: `biografiaId` (resolve via
 * `obterBiografia` em `data/biografias.ts`).
 *
 * Curadoria explicitamente NÃO EXAUSTIVA — cobre só os momentos mais
 * conhecidos e inequívocos; a esmagadora maioria dos diálogos da Bíblia
 * (falas de reis, profetas menores, personagens sem biografia curada
 * etc.) não tem cobertura aqui. Expansão fica para trabalho futuro, mesmo
 * padrão de honestidade sobre escopo parcial de `falasEspeciais.ts`
 * (dataset de Deus) e ADR-017.
 */

export type FaixaNomeadaBruta = [
  codigo: string,
  cInicio: number,
  vInicio: number,
  cFim: number,
  vFim: number,
  biografiaId: string,
];

const FALAS_NOMEADAS: FaixaNomeadaBruta[] = [
  // Confissão de Pedro: "Tu és o Christo, o Filho de Deus vivo" — entre a
  // pergunta de Jesus (Mt 16:15) e sua resposta (Mt 16:17-19), já vermelhas.
  ["MAT", 16, 16, 16, 16, "pedro"],
  // Negação de Pedro, as 3 vezes, no pátio do sumo sacerdote.
  ["MAT", 26, 69, 26, 75, "pedro"],
  // Confissão de Tomé: "Senhor meu, e Deus meu!" — entre duas falas de
  // Jesus (Jo 20:27 e 20:29), já vermelhas.
  ["JHN", 20, 28, 20, 28, "tome"],
  // Magnificat de Maria.
  ["LUK", 1, 46, 1, 55, "maria-mae-de-jesus"],
  // Declaração final de Estêvão diante do Sinédrio, momentos antes do
  // apedrejamento — "Eis que vejo os céus abertos...".
  ["ACT", 7, 56, 7, 56, "estevao"],
  // Testemunho de conversão de Paulo diante da multidão em Jerusalém — as
  // palavras de Jesus dentro do relato (Atos 22:7-8, 22:10, 22:18, 22:21)
  // já são vermelhas via falasEspeciais.ts; aqui marca quem está narrando.
  ["ACT", 22, 6, 22, 16, "paulo"],
  // Testemunho de conversão de Paulo diante do rei Agripa — mesma lógica
  // (Atos 26:14-18, palavras de Jesus, já vermelhas).
  ["ACT", 26, 9, 26, 18, "paulo"],
];

interface FaixaNomeada {
  c1: number;
  v1: number;
  c2: number;
  v2: number;
  biografiaId: string;
}

const indice = new Map<string, FaixaNomeada[]>();
for (const [codigo, c1, v1, c2, v2, biografiaId] of FALAS_NOMEADAS) {
  const faixas = indice.get(codigo) ?? [];
  faixas.push({ c1, v1, c2, v2, biografiaId });
  indice.set(codigo, faixas);
}

function chave(capitulo: number, versiculo: number): number {
  return capitulo * 1000 + versiculo;
}

/** Id de biografia (`../data/biografias.ts`) de quem fala nesse versículo, ou `null`. */
export function obterFalanteNomeado(
  codigoLivro: string,
  capitulo: number,
  versiculo: number,
): string | null {
  const faixas = indice.get(codigoLivro);
  if (!faixas) return null;
  const alvo = chave(capitulo, versiculo);
  const achada = faixas.find(
    (f) => alvo >= chave(f.c1, f.v1) && alvo <= chave(f.c2, f.v2),
  );
  return achada?.biografiaId ?? null;
}

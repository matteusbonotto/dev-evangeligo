import type { TermoChallenge } from "./types";

/**
 * Palavras do "Termo Bíblico" (T-034), migradas de
 * `dev-pwa-biblia-game/public/game/assets/js/dados/desafiosBiblicos.js`
 * (`DESAFIOS_BIBLICOS.termo`).
 *
 * Tamanho DINÂMICO de propósito (T-062/T-063) — o motor (`engine.ts`) usa
 * `resposta.length` pra tudo (grade, teclado, comparação), sempre suportou
 * qualquer tamanho; a auditoria confirmou isso e pediu explicitamente pra
 * NÃO fixar em 5 letras (uma correção anterior nesta mesma sessão tentou
 * fixar em 5 e foi revertida — ver ADR). Palavras de tamanhos variados de
 * propósito, cobrindo 4 a 8 letras.
 */
export const TERMO_CHALLENGES: TermoChallenge[] = [
  {
    id: "termo-graca",
    resposta: "GRAÇA",
    referencia: "Efésios 2:8-9",
    explicacao: "Graça é o favor de Deus que não podemos conquistar por mérito.",
  },
  {
    id: "termo-pastor",
    resposta: "PASTOR",
    referencia: "Salmos 23:1",
    explicacao: "O Senhor é apresentado como o Pastor que guia e cuida do seu povo.",
  },
  {
    id: "termo-alianca",
    resposta: "ALIANÇA",
    referencia: "Gênesis 17:7",
    explicacao: "A aliança expressa o relacionamento de promessa estabelecido por Deus.",
  },
  {
    id: "termo-justo",
    resposta: "JUSTO",
    referencia: "Romanos 1:17",
    explicacao: "O justo vive pela fé e recebe de Deus uma nova direção para a vida.",
  },
  {
    id: "termo-oracao",
    resposta: "ORAÇÃO",
    referencia: "Filipenses 4:6",
    explicacao:
      "A oração apresenta a Deus pedidos e gratidão, fortalecendo a comunhão com Ele.",
  },
  {
    id: "termo-salvador",
    resposta: "SALVADOR",
    referencia: "Lucas 2:11",
    explicacao: "Jesus é anunciado como o Salvador, Cristo e Senhor.",
  },
  {
    id: "termo-perdao",
    resposta: "PERDÃO",
    referencia: "Colossenses 3:13",
    explicacao:
      "O perdão recebido de Cristo se torna o padrão para perdoarmos uns aos outros.",
  },
  {
    id: "termo-templo",
    resposta: "TEMPLO",
    referencia: "1 Coríntios 6:19",
    explicacao: "O corpo do cristão é chamado de templo do Espírito Santo.",
  },
  {
    id: "termo-mana",
    resposta: "MANÁ",
    referencia: "Êxodo 16:31",
    explicacao: "O maná foi o alimento providenciado por Deus para Israel no deserto.",
  },
  {
    id: "termo-pacto",
    resposta: "PACTO",
    referencia: "Gênesis 9:9-13",
    explicacao:
      "Deus fez um pacto com Noé, prometendo nunca mais destruir a terra com um dilúvio — selado pelo arco-íris.",
  },
  {
    id: "termo-verbo",
    resposta: "VERBO",
    referencia: "João 1:1",
    explicacao:
      "\"No princípio era o Verbo\" — Jesus é apresentado como a Palavra eterna de Deus feita carne.",
  },
  {
    id: "termo-rocha",
    resposta: "ROCHA",
    referencia: "1 Coríntios 10:4",
    explicacao:
      "Paulo chama Cristo de \"a Rocha espiritual\" que acompanhou o povo de Israel no deserto.",
  },
  {
    id: "termo-reino",
    resposta: "REINO",
    referencia: "Mateus 6:33",
    explicacao:
      "\"Buscai primeiro o Reino de Deus\" — o chamado a colocar a soberania de Deus acima de tudo.",
  },
  {
    id: "termo-corpo",
    resposta: "CORPO",
    referencia: "1 Coríntios 12:27",
    explicacao:
      "A igreja é chamada de \"corpo de Cristo\", cada membro com uma função diferente e necessária.",
  },
  {
    id: "termo-noiva",
    resposta: "NOIVA",
    referencia: "Apocalipse 21:2",
    explicacao:
      "A igreja é descrita como a noiva preparada para o seu noivo, Cristo, na visão final de João.",
  },
  {
    id: "termo-santo",
    resposta: "SANTO",
    referencia: "1 Pedro 1:16",
    explicacao:
      "\"Sede santos, porque eu sou santo\" — o chamado à santidade que reflete o próprio caráter de Deus.",
  },
  {
    id: "termo-anjos",
    resposta: "ANJOS",
    referencia: "Hebreus 1:14",
    explicacao:
      "Os anjos são descritos como \"espíritos ministradores\", enviados para servir os que herdarão a salvação.",
  },
  {
    id: "termo-monte",
    resposta: "MONTE",
    referencia: "Mateus 5:1",
    explicacao:
      "Jesus sobe ao monte e ensina o Sermão do Monte, começando pelas Bem-aventuranças.",
  },
];

export function getTermoChallengeById(id: string): TermoChallenge | undefined {
  return TERMO_CHALLENGES.find((c) => c.id === id);
}

import type { TermoChallenge } from "./types";

/**
 * Palavras do "Termo Bíblico" (T-034), migradas de
 * `dev-pwa-biblia-game/public/game/assets/js/dados/desafiosBiblicos.js`
 * (`DESAFIOS_BIBLICOS.termo`).
 *
 * Fixado em 5 letras (T-062) — o legado (e o próprio jogo "Termo" que deu
 * nome a este) tinha esse tamanho fixo; o motor deste app (`engine.ts`)
 * sempre suportou qualquer tamanho (usa `resposta.length`), mas isso deixava
 * a experiência inconsistente — usuário reportou "não tem um limite de 5
 * letras fixas" esperando o formato clássico. Removidas as palavras que não
 * tinham 5 letras (Pastor/6, Aliança/7, Oração/6, Salvador/8, Perdão/6,
 * Templo/6, Maná/4) e adicionadas novas de 5 letras.
 */
export const TERMO_CHALLENGES: TermoChallenge[] = [
  {
    id: "termo-graca",
    resposta: "GRAÇA",
    referencia: "Efésios 2:8-9",
    explicacao: "Graça é o favor de Deus que não podemos conquistar por mérito.",
  },
  {
    id: "termo-justo",
    resposta: "JUSTO",
    referencia: "Romanos 1:17",
    explicacao: "O justo vive pela fé e recebe de Deus uma nova direção para a vida.",
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

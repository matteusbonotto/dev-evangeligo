import type { TermoChallenge } from "./types";

/**
 * Palavras do "Termo Bíblico" (T-034), migradas de
 * `dev-pwa-biblia-game/public/game/assets/js/dados/desafiosBiblicos.js`
 * (`DESAFIOS_BIBLICOS.termo`).
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
];

export function getTermoChallengeById(id: string): TermoChallenge | undefined {
  return TERMO_CHALLENGES.find((c) => c.id === id);
}

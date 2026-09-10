import type { Aula, Trilha } from "../schemas";

/**
 * Trilha "TULIP — Os Cinco Pontos do Calvinismo". Resume os cinco pontos
 * formulados no Sínodo de Dort (1618-1619) em resposta ao arminianismo.
 * Mesma política de curadoria/citação da trilha `solas.ts` — ver
 * `IA/docs/content.md` e `IA/memory/decisions.md` ADR-012. Revisão
 * doutrinária formal ainda recomendada (regra 18, ADR-004).
 */
export const TRILHA_TULIP: Trilha = {
  id: "tulip",
  slug: "tulip",
  order: 2,
  title: "TULIP — Os Cinco Pontos do Calvinismo",
  description:
    "Os cinco pontos formulados no Sínodo de Dort (1618-1619) em resposta ao arminianismo, resumidos no acróstico TULIP: como a graça soberana de Deus salva do início ao fim.",
  verseFocus: {
    book: "Efésios",
    chapter: 1,
    verseStart: 11,
    display: "Efésios 1:11",
  },
};

export const AULAS_TULIP: Aula[] = [
  {
    id: "tulip-1",
    trilhaId: "tulip",
    order: 1,
    title: "Depravação Total (T)",
    summary:
      "A depravação total não ensina que todo ser humano seja tão mau quanto poderia ser, mas que o pecado corrompeu completamente a natureza humana — mente, vontade, afetos — de modo que ninguém, por si mesmo, busca a Deus ou é capaz de agradá-lo. Antes da graça, a pessoa está espiritualmente morta em seus delitos e pecados, não apenas doente ou fraca, e seu coração é descrito como enganoso e desesperadamente corrupto. Essa doutrina é o fundamento das demais: se o pecador está morto, e não apenas ferido, a iniciativa da salvação não pode partir dele — precisa vir inteiramente de Deus.",
    bibleReferences: [
      {
        book: "Romanos",
        chapter: 3,
        verseStart: 10,
        verseEnd: 12,
        display: "Romanos 3:10-12",
      },
      { book: "Efésios", chapter: 2, verseStart: 1, display: "Efésios 2:1" },
      {
        book: "Jeremias",
        chapter: 17,
        verseStart: 9,
        display: "Jeremias 17:9",
      },
    ],
    estimatedMinutes: 8,
    quizId: "quiz-tulip-1",
  },
  {
    id: "tulip-2",
    trilhaId: "tulip",
    order: 2,
    title: "Eleição Incondicional (U)",
    summary:
      "Deus escolheu, antes da fundação do mundo, quem seria salvo — não com base em mérito, obra futura prevista ou fé que a pessoa exerceria por conta própria, mas segundo o beneplácito da sua própria vontade. Paulo ilustra isso com Jacó e Esaú: antes de nascerem, antes de fazerem bem ou mal, a eleição de Deus já estava definida, não pelas obras, mas por aquele que chama. Essa doutrina deve despertar reverência e humildade diante do mistério da vontade de Deus, nunca arrogância — a eleição é ato de graça soberana, não resposta a um mérito antecipado.",
    bibleReferences: [
      {
        book: "Efésios",
        chapter: 1,
        verseStart: 4,
        verseEnd: 5,
        display: "Efésios 1:4-5",
      },
      {
        book: "Romanos",
        chapter: 9,
        verseStart: 11,
        verseEnd: 13,
        display: "Romanos 9:11-13",
      },
      { book: "Romanos", chapter: 9, verseStart: 20, display: "Romanos 9:20" },
    ],
    estimatedMinutes: 9,
  },
  {
    id: "tulip-3",
    trilhaId: "tulip",
    order: 3,
    title: "Expiação Particular (L)",
    summary:
      "A obra de Cristo na cruz garante, de modo eficaz e certo, a salvação daqueles que o Pai lhe deu — não apenas torna a salvação possível para todos em potencial. Jesus afirma dar a vida pelas ovelhas, especificamente descritas como suas, e ora não pelo mundo em geral, mas pelos que o Pai lhe deu. Isso não nega o valor infinito do sacrifício de Cristo nem impede o convite sincero do evangelho a todas as pessoas; afirma que a intenção do Pai ao enviar o Filho, e do Filho ao morrer, era efetivamente resgatar um povo específico — a igreja, que ele comprou com o seu próprio sangue.",
    bibleReferences: [
      {
        book: "João",
        chapter: 10,
        verseStart: 14,
        verseEnd: 15,
        display: "João 10:14-15",
      },
      { book: "João", chapter: 17, verseStart: 9, display: "João 17:9" },
      { book: "Atos", chapter: 20, verseStart: 28, display: "Atos 20:28" },
    ],
    estimatedMinutes: 9,
  },
  {
    id: "tulip-4",
    trilhaId: "tulip",
    order: 4,
    title: "Graça Irresistível (I)",
    summary:
      "Quando Deus decide regenerar alguém, esse chamado interior e eficaz não pode, em última instância, ser recusado — não porque force a vontade contra si mesma, mas porque recria o coração para que ele queira livremente o que antes rejeitava. Deus promete tirar o coração de pedra e dar um coração de carne, e Jesus ensina que ninguém pode vir a ele se o Pai não o trouxer. Essa atração não é coerção externa, mas transformação interna: o Espírito regenera antes que a pessoa creia, tornando possível o que antes era impossível, pois a fé nasce de um novo nascimento — não o produz.",
    bibleReferences: [
      {
        book: "Ezequiel",
        chapter: 36,
        verseStart: 26,
        display: "Ezequiel 36:26",
      },
      { book: "João", chapter: 6, verseStart: 44, display: "João 6:44" },
      {
        book: "João",
        chapter: 3,
        verseStart: 5,
        verseEnd: 8,
        display: "João 3:5-8",
      },
    ],
    estimatedMinutes: 8,
  },
  {
    id: "tulip-5",
    trilhaId: "tulip",
    order: 5,
    title: "Perseverança dos Santos (P)",
    summary:
      "Quem foi genuinamente regenerado por Deus não perderá a salvação, porque a obra de Deus nele é guardada pelo poder do próprio Deus, não pela força de vontade do crente. Paulo tem a confiança de que aquele que começou a boa obra a completará até o dia de Cristo, e Jesus afirma que suas ovelhas jamais perecerão, e ninguém as arrebatará da sua mão. Isso não é licença para uma vida despreocupada com o pecado — a Escritura também exorta o crente a perseverar ativamente na fé —, mas certeza de que essa perseverança humana é, ela mesma, fruto da fidelidade de Deus que a sustenta até o fim.",
    bibleReferences: [
      {
        book: "Filipenses",
        chapter: 1,
        verseStart: 6,
        display: "Filipenses 1:6",
      },
      {
        book: "João",
        chapter: 10,
        verseStart: 28,
        verseEnd: 29,
        display: "João 10:28-29",
      },
      { book: "Hebreus", chapter: 3, verseStart: 14, display: "Hebreus 3:14" },
    ],
    estimatedMinutes: 8,
  },
];

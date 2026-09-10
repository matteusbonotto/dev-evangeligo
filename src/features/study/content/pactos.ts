import type { Aula, Trilha } from "../schemas";

/**
 * Trilha "Pactos" (teologia do pacto/covenant theology). Mesma política de
 * curadoria/citação das demais trilhas — ver `IA/docs/content.md` e
 * `IA/memory/decisions.md` ADR-012. Revisão doutrinária formal ainda
 * recomendada (regra 18, ADR-004).
 */
export const TRILHA_PACTOS: Trilha = {
  id: "pactos",
  slug: "pactos",
  order: 4,
  title: "Pactos: A Aliança de Deus com o Seu Povo",
  description:
    "A Escritura se organiza em torno de alianças que Deus estabelece com a humanidade — a estrutura que une todo o plano redentor, do Éden à nova aliança em Cristo.",
  verseFocus: {
    book: "Hebreus",
    chapter: 8,
    verseStart: 6,
    display: "Hebreus 8:6",
  },
};

export const AULAS_PACTOS: Aula[] = [
  {
    id: "pactos-1",
    trilhaId: "pactos",
    order: 1,
    title: "O Pacto das Obras: Adão e a Aliança Perdida",
    summary:
      "Antes da queda, Deus estabeleceu com Adão — representante de toda a humanidade — uma aliança condicionada à obediência: comer livremente de qualquer árvore do jardim, menos da árvore do conhecimento do bem e do mal, sob pena de morte. Embora a palavra 'pacto' não apareça de forma explícita nesse relato, o profeta Oseias parece se referir retrospectivamente a essa aliança quebrada por Adão. Adão falhou, e sua desobediência trouxe pecado e morte a toda a raça humana que ele representava, estabelecendo a necessidade de um segundo Adão que obedecesse onde o primeiro falhou.",
    bibleReferences: [
      {
        book: "Gênesis",
        chapter: 2,
        verseStart: 16,
        verseEnd: 17,
        display: "Gênesis 2:16-17",
      },
      { book: "Oséias", chapter: 6, verseStart: 7, display: "Oséias 6:7" },
      { book: "Romanos", chapter: 5, verseStart: 12, display: "Romanos 5:12" },
    ],
    estimatedMinutes: 9,
    quizId: "quiz-pactos-1",
  },
  {
    id: "pactos-2",
    trilhaId: "pactos",
    order: 2,
    title: "O Pacto da Graça: Cristo, o Segundo Adão",
    summary:
      "Diante da queda, Deus não abandona seu propósito redentor: já no Éden promete que a descendência da mulher esmagaria a cabeça da serpente — a primeira promessa do evangelho. Esse pacto de graça se desdobra ao longo da história e culmina em uma nova aliança prometida por Jeremias, na qual a lei seria escrita no coração e os pecados perdoados de forma definitiva. Hebreus mostra que essa nova aliança, mediada por Cristo, é superior às alianças anteriores porque se funda em promessas melhores. Onde Adão, o primeiro representante, falhou, Cristo, o segundo Adão, obedeceu perfeitamente e reverteu, para todos os que estão nele, a condenação herdada.",
    bibleReferences: [
      { book: "Gênesis", chapter: 3, verseStart: 15, display: "Gênesis 3:15" },
      {
        book: "Jeremias",
        chapter: 31,
        verseStart: 31,
        verseEnd: 34,
        display: "Jeremias 31:31-34",
      },
      { book: "Hebreus", chapter: 8, verseStart: 6, display: "Hebreus 8:6" },
      {
        book: "Romanos",
        chapter: 5,
        verseStart: 18,
        verseEnd: 19,
        display: "Romanos 5:18-19",
      },
    ],
    estimatedMinutes: 9,
  },
];

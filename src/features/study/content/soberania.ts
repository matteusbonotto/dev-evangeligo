import type { Aula, Trilha } from "../schemas";

/**
 * Trilha "Soberania de Deus". Mesma política de curadoria/citação das
 * demais trilhas — ver `IA/docs/content.md` e `IA/memory/decisions.md`
 * ADR-012. Revisão doutrinária formal ainda recomendada (regra 18, ADR-004).
 */
export const TRILHA_SOBERANIA: Trilha = {
  id: "soberania",
  slug: "soberania",
  order: 3,
  title: "Soberania de Deus",
  description:
    "Deus reina sobre toda a criação, a história e a salvação; nada escapa ao seu governo sábio e bom — nem mesmo o sofrimento humano.",
  verseFocus: {
    book: "Salmos",
    chapter: 103,
    verseStart: 19,
    display: "Salmos 103:19",
  },
};

export const AULAS_SOBERANIA: Aula[] = [
  {
    id: "soberania-1",
    trilhaId: "soberania",
    order: 1,
    title: "Deus Reina: Soberania na Criação e na Providência",
    summary:
      "A soberania de Deus significa que ele governa ativamente tudo o que existe — não apenas criou o mundo e o deixou seguir seu curso, mas sustenta e dirige cada evento dentro dele. O salmista declara que o Senhor estabeleceu seu trono nos céus e que o seu reino domina sobre tudo. Daniel, diante do orgulho de um rei pagão, testemunha que o Altíssimo domina sobre o reino dos homens e o dá a quem quer, e Paulo confirma que Deus realiza todas as coisas segundo o conselho da sua própria vontade. Essa doutrina não elimina a responsabilidade humana, mas garante que nenhum evento — grande ou pequeno — escapa ao governo sábio e bom de Deus.",
    bibleReferences: [
      {
        book: "Salmos",
        chapter: 103,
        verseStart: 19,
        display: "Salmos 103:19",
      },
      { book: "Daniel", chapter: 4, verseStart: 35, display: "Daniel 4:35" },
      { book: "Efésios", chapter: 1, verseStart: 11, display: "Efésios 1:11" },
    ],
    estimatedMinutes: 9,
    quizId: "quiz-soberania-1",
  },
  {
    id: "soberania-2",
    trilhaId: "soberania",
    order: 2,
    title: "A Soberania de Deus e o Sofrimento Humano",
    summary:
      "A mesma soberania que governa estrelas e nações também governa a dor e as perdas de cada crente, sem que isso torne Deus autor do mal ou indiferente ao sofrimento. José reconhece que o mal que seus irmãos planejaram contra ele, Deus o tornou parte de um propósito bom. Paulo ensina que Deus faz todas as coisas cooperarem para o bem daqueles que o amam — não que todo evento seja bom em si mesmo, mas que Deus o tece dentro de um propósito maior. Diante do sofrimento inexplicável, Deus não oferece a Jó uma explicação detalhada, mas revela sua grandeza soberana, convidando à confiança mesmo quando a razão do sofrimento permanece oculta aos nossos olhos.",
    bibleReferences: [
      {
        book: "Gênesis",
        chapter: 50,
        verseStart: 20,
        display: "Gênesis 50:20",
      },
      { book: "Romanos", chapter: 8, verseStart: 28, display: "Romanos 8:28" },
      {
        book: "Jó",
        chapter: 38,
        verseStart: 1,
        verseEnd: 4,
        display: "Jó 38:1-4",
      },
      {
        book: "Isaías",
        chapter: 55,
        verseStart: 8,
        verseEnd: 9,
        display: "Isaías 55:8-9",
      },
    ],
    estimatedMinutes: 9,
  },
];

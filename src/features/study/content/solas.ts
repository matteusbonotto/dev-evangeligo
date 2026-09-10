import type { Aula, Trilha } from "../schemas";

/**
 * Trilha "As Cinco Solas da Reforma". Conteúdo introdutório de teologia
 * reformada, curado pelo Content Specialist a partir de fontes clássicas
 * da Reforma (ver `IA/docs/content.md` para as fontes e `IA/memory/
 * decisions.md` ADR-012 para o processo de curadoria). Nenhum texto de
 * versículo é citado literalmente — apenas a referência (regra 22).
 * Revisão doutrinária formal do agente `teologia-reformada` ainda
 * recomendada antes do lançamento público (regra 18, ADR-004).
 */
export const TRILHA_SOLAS: Trilha = {
  id: "solas",
  slug: "solas",
  order: 1,
  title: "As Cinco Solas da Reforma",
  description:
    "A base doutrinária da Reforma Protestante: cinco afirmações que resumem de onde vêm a autoridade, a graça e a glória na vida cristã.",
  verseFocus: {
    book: "Romanos",
    chapter: 11,
    verseStart: 36,
    display: "Romanos 11:36",
  },
};

export const AULAS_SOLAS: Aula[] = [
  {
    id: "solas-1",
    trilhaId: "solas",
    order: 1,
    title: "Sola Scriptura — A Escritura Somente",
    summary:
      "A Reforma recuperou o princípio de que a Bíblia é a única regra infalível de fé e prática, acima de tradições eclesiásticas, concílios ou experiências místicas. Isso não nega o valor de credos e confissões históricas — a tradição reformada os usa fartamente —, mas afirma que toda doutrina precisa, em última instância, se sustentar na Escritura. A Palavra é suficiente para instruir, corrigir e preparar o crente para toda boa obra, e é o próprio Cristo quem manda buscar nela testemunho a seu respeito. O povo de Bereia é elogiado justamente por examinar as Escrituras para confirmar até o ensino apostólico — um padrão que continua válido para qualquer ensino, inclusive o desta trilha.",
    bibleReferences: [
      {
        book: "2 Timóteo",
        chapter: 3,
        verseStart: 16,
        verseEnd: 17,
        display: "2 Timóteo 3:16-17",
      },
      { book: "João", chapter: 5, verseStart: 39, display: "João 5:39" },
      { book: "Atos", chapter: 17, verseStart: 11, display: "Atos 17:11" },
    ],
    estimatedMinutes: 8,
    quizId: "quiz-solas-1",
  },
  {
    id: "solas-2",
    trilhaId: "solas",
    order: 2,
    title: "Sola Fide — Somente a Fé",
    summary:
      "A justificação — ser declarado justo diante de Deus — acontece somente pela fé, não pelo cumprimento da lei ou por méritos próprios. Paulo argumenta que ninguém é justificado pelas obras da lei, mas pela fé em Cristo, e que essa justificação é dom recebido pela graça, mediante a fé, e não conquistado por esforço. Isso não torna as obras irrelevantes: elas são fruto necessário de uma fé genuína, mas nunca sua causa. A fé salvadora não é um mérito humano que Deus recompensa; é o instrumento pelo qual o crente recebe a justiça que já é de Cristo — por isso ninguém tem motivo para se gloriar.",
    bibleReferences: [
      { book: "Gálatas", chapter: 2, verseStart: 16, display: "Gálatas 2:16" },
      { book: "Romanos", chapter: 3, verseStart: 28, display: "Romanos 3:28" },
      {
        book: "Efésios",
        chapter: 2,
        verseStart: 8,
        verseEnd: 9,
        display: "Efésios 2:8-9",
      },
      { book: "Tiago", chapter: 2, verseStart: 17, display: "Tiago 2:17" },
    ],
    estimatedMinutes: 8,
  },
  {
    id: "solas-3",
    trilhaId: "solas",
    order: 3,
    title: "Sola Gratia — Somente a Graça",
    summary:
      "A salvação começa, se sustenta e se completa pela graça de Deus, um favor imerecido concedido a pecadores que, por natureza, estão espiritualmente mortos e incapazes de buscar a Deus por si mesmos. A graça não é uma ajuda que Deus oferece para complementar o esforço humano; é a causa determinante da salvação do início ao fim. Mesmo a fé com que a graça é recebida é, ela mesma, dom de Deus, não produção humana — por isso ninguém pode se gloriar. Esse princípio desloca todo o peso da salvação para o caráter e a iniciativa de Deus, não para a misericórdia que o pecador teria despertado nele.",
    bibleReferences: [
      {
        book: "Efésios",
        chapter: 2,
        verseStart: 1,
        verseEnd: 5,
        display: "Efésios 2:1-5",
      },
      {
        book: "Efésios",
        chapter: 2,
        verseStart: 8,
        verseEnd: 9,
        display: "Efésios 2:8-9",
      },
      { book: "Tito", chapter: 3, verseStart: 5, display: "Tito 3:5" },
    ],
    estimatedMinutes: 7,
  },
  {
    id: "solas-4",
    trilhaId: "solas",
    order: 4,
    title: "Solus Christus — Somente Cristo",
    summary:
      "Cristo é o único mediador entre Deus e os homens, o único caminho de acesso ao Pai e o único nome dado aos homens pelo qual se pode ser salvo. A Reforma rejeitou qualquer mediação adicional — de santos, sacerdotes humanos ou méritos acumulados — não porque a igreja e seus ministros não tenham valor, mas porque a obra de Cristo na cruz é suficiente e não pode ser complementada. Hebreus descreve Jesus como sumo sacerdote que, ao contrário dos sacerdotes levíticos, ofereceu a si mesmo uma única vez, de modo definitivo, encerrando a necessidade de qualquer outro sacrifício ou mediador.",
    bibleReferences: [
      {
        book: "1 Timóteo",
        chapter: 2,
        verseStart: 5,
        display: "1 Timóteo 2:5",
      },
      { book: "João", chapter: 14, verseStart: 6, display: "João 14:6" },
      { book: "Atos", chapter: 4, verseStart: 12, display: "Atos 4:12" },
      {
        book: "Hebreus",
        chapter: 7,
        verseStart: 26,
        verseEnd: 27,
        display: "Hebreus 7:26-27",
      },
    ],
    estimatedMinutes: 8,
  },
  {
    id: "solas-5",
    trilhaId: "solas",
    order: 5,
    title: "Soli Deo Gloria — Glória Somente a Deus",
    summary:
      "Se a Escritura é a única autoridade, a fé o único instrumento, a graça a única causa e Cristo o único mediador, então toda a glória da salvação pertence exclusivamente a Deus — nenhuma parte é repartida com o esforço humano. Paulo encerra sua grande exposição da soberania de Deus na salvação com uma doxologia: dEle, por Ele e para Ele são todas as coisas, a Ele a glória para sempre. Esse princípio não é apenas teológico; é prático — toda a vida cristã, incluindo os hábitos mais simples do dia a dia, deve ser vivida para a glória de Deus, e é justamente esse horizonte que dá às demais quatro solas o seu propósito final.",
    bibleReferences: [
      {
        book: "Romanos",
        chapter: 11,
        verseStart: 36,
        display: "Romanos 11:36",
      },
      {
        book: "1 Coríntios",
        chapter: 10,
        verseStart: 31,
        display: "1 Coríntios 10:31",
      },
      { book: "Isaías", chapter: 42, verseStart: 8, display: "Isaías 42:8" },
    ],
    estimatedMinutes: 7,
  },
];

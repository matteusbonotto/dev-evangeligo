import type { Quiz } from "./schemas";

/**
 * Conteúdo estático dos quizzes (T-008, RF-08/RF-11). Um quiz por trilha,
 * associado à primeira aula de cada uma (`aula.quizId`, ver
 * `../content/*.ts`), cobrindo os 3 tipos de pergunta em cada quiz.
 * Perguntas originais escritas a partir do resumo/referências já revisados
 * da aula correspondente — nunca citam texto de versículo (regra 22 de
 * `IA/memory/rules.md`), apenas a referência. Revisão doutrinária formal
 * do agente `teologia-reformada` ainda recomendada antes do lançamento
 * público (regra 18, ADR-004), mesmo status das demais aulas (T-007).
 */
export const QUIZZES: Quiz[] = [
  {
    id: "quiz-solas-1",
    aulaId: "solas-1",
    title: "Sola Scriptura",
    questions: [
      {
        id: "quiz-solas-1-q1",
        type: "escolha_unica",
        prompt:
          "Segundo a Sola Scriptura, qual é a posição da Escritura em relação a tradições eclesiásticas e concílios?",
        options: [
          {
            id: "a",
            text: "É a única regra infalível de fé e prática, acima delas",
          },
          {
            id: "b",
            text: "Tem autoridade igual e complementar à da tradição",
          },
          {
            id: "c",
            text: "Pode ser corrigida por concílios quando necessário",
          },
        ],
        correctOptionId: "a",
        explanation:
          "A Escritura é suficiente para instruir, corrigir e preparar o crente para toda boa obra — ela julga a tradição, não o contrário.",
        bibleReference: {
          book: "2 Timóteo",
          chapter: 3,
          verseStart: 16,
          verseEnd: 17,
          display: "2 Timóteo 3:16-17",
        },
      },
      {
        id: "quiz-solas-1-q2",
        type: "verdadeiro_falso",
        prompt:
          "A Sola Scriptura nega qualquer valor a credos e confissões históricas.",
        correctAnswer: false,
        explanation:
          "A tradição reformada usa fartamente credos e confissões — a Sola Scriptura exige apenas que toda doutrina, inclusive a deles, se sustente em última instância na Escritura.",
        bibleReference: {
          book: "Atos",
          chapter: 17,
          verseStart: 11,
          display: "Atos 17:11",
        },
      },
      {
        id: "quiz-solas-1-q3",
        type: "multipla_selecao",
        prompt:
          "O que o exemplo do povo de Bereia (Atos 17:11) ensina sobre como receber um ensino, mesmo apostólico?",
        options: [
          {
            id: "a",
            text: "Examinavam as Escrituras diariamente para confirmar o que ouviam",
          },
          {
            id: "b",
            text: "Aceitavam qualquer ensino sem verificação, por respeito ao mensageiro",
          },
          {
            id: "c",
            text: "Usavam a Escritura como padrão para testar até o ensino apostólico",
          },
          {
            id: "d",
            text: "Rejeitavam por princípio qualquer pregador vindo de fora",
          },
        ],
        correctOptionIds: ["a", "c"],
        explanation:
          "Bereia é elogiada exatamente por examinar as Escrituras para confirmar o ensino — um padrão que vale até para o ensino apostólico, e continua válido hoje.",
        bibleReference: {
          book: "Atos",
          chapter: 17,
          verseStart: 11,
          display: "Atos 17:11",
        },
      },
    ],
  },
  {
    id: "quiz-tulip-1",
    aulaId: "tulip-1",
    title: "Depravação Total (T)",
    questions: [
      {
        id: "quiz-tulip-1-q1",
        type: "escolha_unica",
        prompt: "O que a doutrina da Depravação Total realmente afirma?",
        options: [
          { id: "a", text: "Todo ser humano é tão mau quanto poderia ser" },
          {
            id: "b",
            text: "O pecado corrompeu completamente a natureza humana, tornando-a incapaz de buscar a Deus por si mesma",
          },
          {
            id: "c",
            text: "Apenas algumas pessoas nascem afetadas pelo pecado",
          },
        ],
        correctOptionId: "b",
        explanation:
          "Não é sobre intensidade de maldade — é sobre abrangência: mente, vontade e afetos corrompidos, de modo que ninguém busca a Deus por si mesmo.",
        bibleReference: {
          book: "Jeremias",
          chapter: 17,
          verseStart: 9,
          display: "Jeremias 17:9",
        },
      },
      {
        id: "quiz-tulip-1-q2",
        type: "verdadeiro_falso",
        prompt:
          "Segundo Efésios 2:1, antes da graça a pessoa está apenas espiritualmente doente ou fraca, não morta.",
        correctAnswer: false,
        explanation:
          "O texto descreve alguém morto em delitos e pecados, não ferido ou fraco — por isso a iniciativa da salvação precisa vir inteiramente de Deus.",
        bibleReference: {
          book: "Efésios",
          chapter: 2,
          verseStart: 1,
          display: "Efésios 2:1",
        },
      },
      {
        id: "quiz-tulip-1-q3",
        type: "multipla_selecao",
        prompt: "Quais afirmações sobre a Depravação Total estão corretas?",
        options: [
          {
            id: "a",
            text: "A mente, a vontade e os afetos foram corrompidos pelo pecado",
          },
          {
            id: "b",
            text: "A iniciativa da salvação precisa vir inteiramente de Deus",
          },
          {
            id: "c",
            text: "Mesmo antes da graça, o pecador ainda consegue buscar a Deus com algum esforço próprio",
          },
        ],
        correctOptionIds: ["a", "b"],
        explanation:
          "Se o pecador está morto, e não apenas ferido, ele não pode dar o primeiro passo — a doutrina é justamente o fundamento de que a graça precisa iniciar tudo.",
        bibleReference: {
          book: "Romanos",
          chapter: 3,
          verseStart: 10,
          verseEnd: 12,
          display: "Romanos 3:10-12",
        },
      },
    ],
  },
  {
    id: "quiz-soberania-1",
    aulaId: "soberania-1",
    title: "Deus Reina",
    questions: [
      {
        id: "quiz-soberania-1-q1",
        type: "escolha_unica",
        prompt: "Segundo Daniel 4:35, sobre o que o Altíssimo exerce domínio?",
        options: [
          { id: "a", text: "Apenas sobre a nação de Israel" },
          { id: "b", text: "Sobre o reino dos homens, dando-o a quem quer" },
          { id: "c", text: "Somente sobre eventos espirituais, não políticos" },
        ],
        correctOptionId: "b",
        explanation:
          "Diante do orgulho de um rei pagão, Daniel testemunha que o Altíssimo domina sobre o reino dos homens — a soberania de Deus alcança até governantes que não o reconhecem.",
        bibleReference: {
          book: "Daniel",
          chapter: 4,
          verseStart: 35,
          display: "Daniel 4:35",
        },
      },
      {
        id: "quiz-soberania-1-q2",
        type: "verdadeiro_falso",
        prompt:
          "Segundo a aula, a soberania de Deus elimina a responsabilidade humana.",
        correctAnswer: false,
        explanation:
          "A doutrina afirma que nenhum evento escapa ao governo de Deus, mas não anula a responsabilidade humana — as duas verdades coexistem na Escritura.",
        bibleReference: {
          book: "Efésios",
          chapter: 1,
          verseStart: 11,
          display: "Efésios 1:11",
        },
      },
      {
        id: "quiz-soberania-1-q3",
        type: "multipla_selecao",
        prompt:
          "Quais referências a aula usa para sustentar que Deus governa ativamente tudo o que existe?",
        options: [
          { id: "a", text: "Salmos 103:19" },
          { id: "b", text: "Efésios 1:11" },
          { id: "c", text: "Daniel 4:35" },
          { id: "d", text: "Gênesis 1:1" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "O salmista, Daniel e Paulo são citados juntos para mostrar o mesmo governo soberano sobre criação, nações e o propósito eterno de Deus.",
        bibleReference: {
          book: "Salmos",
          chapter: 103,
          verseStart: 19,
          display: "Salmos 103:19",
        },
      },
    ],
  },
  {
    id: "quiz-pactos-1",
    aulaId: "pactos-1",
    title: "O Pacto das Obras",
    questions: [
      {
        id: "quiz-pactos-1-q1",
        type: "escolha_unica",
        prompt:
          "Qual foi a condição do pacto que Deus estabeleceu com Adão no jardim?",
        options: [
          {
            id: "a",
            text: "Obediência: não comer da árvore do conhecimento do bem e do mal",
          },
          { id: "b", text: "Oferecer sacrifícios diários" },
          {
            id: "c",
            text: "Multiplicar-se e povoar a terra, sem outra condição",
          },
        ],
        correctOptionId: "a",
        explanation:
          "Deus permitiu comer livremente de qualquer árvore, exceto da árvore do conhecimento do bem e do mal, sob pena de morte.",
        bibleReference: {
          book: "Gênesis",
          chapter: 2,
          verseStart: 16,
          verseEnd: 17,
          display: "Gênesis 2:16-17",
        },
      },
      {
        id: "quiz-pactos-1-q2",
        type: "verdadeiro_falso",
        prompt:
          'A palavra "pacto" aparece de forma explícita no relato de Gênesis 2 sobre Adão.',
        correctAnswer: false,
        explanation:
          "A palavra não aparece de forma explícita nesse relato — é o profeta Oseias quem parece se referir retrospectivamente a essa aliança quebrada por Adão.",
        bibleReference: {
          book: "Oséias",
          chapter: 6,
          verseStart: 7,
          display: "Oséias 6:7",
        },
      },
      {
        id: "quiz-pactos-1-q3",
        type: "multipla_selecao",
        prompt: "Quais consequências a aula atribui à desobediência de Adão?",
        options: [
          {
            id: "a",
            text: "Trouxe pecado e morte a toda a raça humana que ele representava",
          },
          {
            id: "b",
            text: "Estabeleceu a necessidade de um segundo Adão que obedecesse onde o primeiro falhou",
          },
          { id: "c", text: "Não teve nenhum efeito sobre seus descendentes" },
        ],
        correctOptionIds: ["a", "b"],
        explanation:
          "Adão representava toda a humanidade; sua queda atinge todos os seus descendentes e abre espaço para a obra do segundo Adão, Cristo (ver a próxima aula).",
        bibleReference: {
          book: "Romanos",
          chapter: 5,
          verseStart: 12,
          display: "Romanos 5:12",
        },
      },
    ],
  },
  {
    id: "quiz-obras-fruto-1",
    aulaId: "obras-fruto-1",
    title: "Andar em Espírito, Não na Carne",
    questions: [
      {
        id: "quiz-obras-fruto-1-q1",
        type: "escolha_unica",
        prompt:
          "Segundo a aula, qual é o chamado ao crente diante do conflito entre carne e Espírito?",
        options: [
          {
            id: "a",
            text: "Vencer o conflito por esforço isolado e força de vontade",
          },
          {
            id: "b",
            text: "Andar em Espírito, dependendo continuamente da presença e do poder do Espírito Santo",
          },
          {
            id: "c",
            text: "Ignorar o conflito, pois ele não afeta a vida cristã",
          },
        ],
        correctOptionId: "b",
        explanation:
          "Paulo repete o chamado à ação concreta: se vivemos em Espírito, andemos também em Espírito — dependência contínua, não esforço isolado.",
        bibleReference: {
          book: "Gálatas",
          chapter: 5,
          verseStart: 25,
          display: "Gálatas 5:25",
        },
      },
      {
        id: "quiz-obras-fruto-1-q2",
        type: "verdadeiro_falso",
        prompt:
          "Segundo a aula, andar em Espírito é uma conquista de mérito diante de Deus.",
        correctAnswer: false,
        explanation:
          "Nunca como conquista de mérito — é fruto da nova vida já dada pela graça, nunca prova ou causa de salvação (regras 19-20 de IA/memory/rules.md).",
        bibleReference: {
          book: "Romanos",
          chapter: 8,
          verseStart: 5,
          verseEnd: 6,
          display: "Romanos 8:5-6",
        },
      },
      {
        id: "quiz-obras-fruto-1-q3",
        type: "multipla_selecao",
        prompt:
          "Quais afirmações refletem corretamente o ensino de Gálatas 5:16-17?",
        options: [
          {
            id: "a",
            text: "A carne deseja contra o Espírito, e o Espírito deseja contra a carne",
          },
          {
            id: "b",
            text: "Romanos 8:5-6 reforça que a mentalidade do Espírito é vida e paz",
          },
          {
            id: "c",
            text: "O conflito entre carne e Espírito só existe antes da conversão",
          },
        ],
        correctOptionIds: ["a", "b"],
        explanation:
          "O conflito é descrito como constante na vida cristã — o chamado é para andar em Espírito dentro dele, não para uma fase que termina na conversão.",
        bibleReference: {
          book: "Gálatas",
          chapter: 5,
          verseStart: 16,
          verseEnd: 17,
          display: "Gálatas 5:16-17",
        },
      },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return QUIZZES.find((quiz) => quiz.id === id);
}

export function getQuizByAulaId(aulaId: string): Quiz | undefined {
  return QUIZZES.find((quiz) => quiz.aulaId === aulaId);
}

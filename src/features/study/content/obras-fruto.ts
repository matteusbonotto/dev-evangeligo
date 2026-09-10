import type { Aula, Trilha } from "../schemas";

/**
 * Trilha "Obras da Carne e Fruto do Espírito" (Gálatas 5:16-23). Mantém
 * consistência deliberada com a ADR-007 (dashboard/HUD "vida interior"):
 * mesma base bíblica, mesma distinção de nomes (obras da carne vs. fruto
 * do Espírito — não invertidos) e menção explícita de que o mesmo conteúdo
 * aparece resumido no painel do usuário. Ver `IA/memory/decisions.md`
 * ADR-013. Revisão doutrinária formal ainda recomendada (regra 18,
 * ADR-004). Gamificação nunca implica mérito espiritual (regras 19-20):
 * estas aulas descrevem fruto e obra como resultado da graça, não como
 * conquista.
 */
export const TRILHA_OBRAS_FRUTO: Trilha = {
  id: "obras-fruto",
  slug: "obras-fruto",
  order: 5,
  title: "Obras da Carne e Fruto do Espírito",
  description:
    "A vida cristã é um combate contínuo entre andar segundo a carne e andar segundo o Espírito — a mesma base bíblica (Gl 5:16-23) usada no painel de 'vida interior' do jogador.",
  verseFocus: {
    book: "Gálatas",
    chapter: 5,
    verseStart: 16,
    display: "Gálatas 5:16",
  },
};

export const AULAS_OBRAS_FRUTO: Aula[] = [
  {
    id: "obras-fruto-1",
    trilhaId: "obras-fruto",
    order: 1,
    title: "Andar em Espírito, Não na Carne",
    summary:
      "Paulo descreve a vida cristã como um conflito constante entre dois princípios opostos: a carne, que deseja contra o Espírito, e o Espírito, que deseja contra a carne. O chamado ao crente não é vencer esse conflito por esforço isolado, mas andar em Espírito — depender continuamente da presença e do poder do Espírito Santo — e, assim, não cumprir os desejos da carne. Paulo repete esse chamado à ação concreta ao final do capítulo: se vivemos em Espírito, andemos também em Espírito. Romanos reforça que a mentalidade da carne é morte, mas a mentalidade do Espírito é vida e paz, situando esse combate no centro da experiência cristã diária — nunca como conquista de mérito diante de Deus, mas como fruto da nova vida já dada pela graça.",
    bibleReferences: [
      {
        book: "Gálatas",
        chapter: 5,
        verseStart: 16,
        verseEnd: 17,
        display: "Gálatas 5:16-17",
      },
      { book: "Gálatas", chapter: 5, verseStart: 25, display: "Gálatas 5:25" },
      {
        book: "Romanos",
        chapter: 8,
        verseStart: 5,
        verseEnd: 6,
        display: "Romanos 8:5-6",
      },
    ],
    estimatedMinutes: 8,
    quizId: "quiz-obras-fruto-1",
  },
  {
    id: "obras-fruto-2",
    trilhaId: "obras-fruto",
    order: 2,
    title: "As Obras da Carne",
    summary:
      "Gálatas 5:19-21 lista de forma explícita as obras da carne — entre elas impureza, idolatria, inimizades, contendas, invejas, ira e embriaguez — como manifestações visíveis de uma vida ainda dominada pelo pecado, sintomas de uma raiz comum: viver desconectado do Espírito. Paulo alerta que quem pratica essas coisas, como estilo de vida contínuo e não arrependido, não herdará o Reino de Deus — um aviso pastoral, não um novo sistema de méritos: a base da salvação continua sendo a graça, mas a graça verdadeira transforma o modo de viver. Efésios usa linguagem semelhante para alertar contra o mesmo padrão de vida. No painel de 'vida interior' do aplicativo, estas obras aparecem agrupadas em 9 categorias, cada uma contraposta a um fruto do Espírito correspondente (ver a próxima aula).",
    bibleReferences: [
      {
        book: "Gálatas",
        chapter: 5,
        verseStart: 19,
        verseEnd: 21,
        display: "Gálatas 5:19-21",
      },
      {
        book: "Efésios",
        chapter: 5,
        verseStart: 3,
        verseEnd: 5,
        display: "Efésios 5:3-5",
      },
      {
        book: "Efésios",
        chapter: 2,
        verseStart: 8,
        verseEnd: 9,
        display: "Efésios 2:8-9",
      },
    ],
    estimatedMinutes: 9,
  },
  {
    id: "obras-fruto-3",
    trilhaId: "obras-fruto",
    order: 3,
    title: "O Fruto do Espírito",
    summary:
      "Em contraste com as obras da carne, Paulo descreve o fruto do Espírito — no singular, sugerindo uma unidade orgânica, não uma lista de conquistas separadas — como amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade, mansidão e domínio próprio. É 'fruto', não 'esforço' ou 'obra': nasce naturalmente de uma vida enraizada em Cristo, assim como um ramo unido à videira produz fruto sem produzi-lo por si mesmo. Contra esse fruto, Paulo observa, não há lei — ninguém precisa de mandamento externo para amar ou ter paz quando essas qualidades já brotam de dentro pela ação do Espírito. Este é o mesmo fruto tratado no painel de 'vida interior' do aplicativo, onde cada uma das 9 virtudes é contraposta à obra da carne correspondente.",
    bibleReferences: [
      {
        book: "Gálatas",
        chapter: 5,
        verseStart: 22,
        verseEnd: 23,
        display: "Gálatas 5:22-23",
      },
      {
        book: "João",
        chapter: 15,
        verseStart: 4,
        verseEnd: 5,
        display: "João 15:4-5",
      },
      {
        book: "Colossenses",
        chapter: 3,
        verseStart: 12,
        verseEnd: 14,
        display: "Colossenses 3:12-14",
      },
    ],
    estimatedMinutes: 9,
  },
];

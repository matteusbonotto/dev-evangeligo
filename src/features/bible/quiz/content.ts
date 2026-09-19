import type { BibleReference } from "../../study/schemas";
import type { Quiz, QuizQuestion } from "../../study/quiz/schemas";

/**
 * Quiz por capítulo/livro da Bíblia (T-045). Plano completo em
 * `IA/docs/quiz-biblico-plano.md` — a escala real (~7.265 perguntas pra
 * cobrir a Bíblia inteira) exige faseamento; esta é a PRIMEIRA fatia real
 * (prova de conceito com um livro inteiro, escala pequena o bastante pra
 * escrever com cuidado doutrinário nesta sessão), não a Fase 1 completa do
 * plano (4 Evangelhos, 525 perguntas) — essa continua para uma rodada
 * dedicada futura.
 *
 * Livro escolhido: **Rute**, 4 capítulos curtos, narrativa linear, sem
 * passagem doutrinariamente controversa — bom primeiro caso pra validar o
 * formato ponta a ponta (motor + conteúdo + persistência + UI) antes de
 * investir em livros maiores.
 *
 * Toda pergunta testa COMPREENSÃO do próprio texto (evento, personagem,
 * ordem dos fatos, ensino explícito) — nunca interpretação doutrinária
 * controversa (diretriz do plano, seção 7). Toda referência é conferível
 * direto contra `public/data/biblia-almeida.json` (a mesma fonte que serve
 * a leitura). Revisão doutrinária formal pelo agente `teologia-reformada`
 * ainda recomendada antes do lançamento público (mesmo padrão não-
 * bloqueante já usado no restante do conteúdo do app, ver ADR-007/036).
 */

const LIVRO_ORDER_RUTE = 8;

function ref(
  chapter: number,
  verseStart: number,
  verseEnd: number | undefined,
  display: string,
): BibleReference {
  return { book: "Rute", chapter, verseStart, verseEnd, display };
}

function unica(
  id: string,
  prompt: string,
  options: [string, string, ...string[]],
  correctIndex: number,
  explanation: string,
  bibleReference: BibleReference,
): QuizQuestion {
  return {
    type: "escolha_unica",
    id,
    prompt,
    explanation,
    bibleReference,
    options: options.map((text, index) => ({ id: `${id}-op${index + 1}`, text })),
    correctOptionId: `${id}-op${correctIndex + 1}`,
  };
}

function vf(
  id: string,
  prompt: string,
  correctAnswer: boolean,
  explanation: string,
  bibleReference: BibleReference,
): QuizQuestion {
  return { type: "verdadeiro_falso", id, prompt, explanation, bibleReference, correctAnswer };
}

// ─── Capítulo 1 — Elimeleque, a fome, a viuvez, a lealdade de Rute ─────────
const RUTE_1: QuizQuestion[] = [
  unica(
    "rut-1-1",
    "Por que Elimeleque levou sua família de Belém para as terras de Moabe?",
    ["Havia fome na terra de Judá", "Fugia de perseguição religiosa", "Foi convocado para servir o rei de Moabe", "Buscava terras mais férteis por ambição"],
    0,
    "O capítulo abre com uma fome em Judá, o motivo direto da mudança da família para Moabe.",
    ref(1, 1, 1, "Rute 1:1"),
  ),
  unica(
    "rut-1-2",
    "Quais eram os nomes da esposa e dos dois filhos de Elimeleque?",
    ["Noemi, e os filhos Malom e Quiliom", "Orfa, e os filhos Obede e Jessé", "Rute, e os filhos Boaz e Davi", "Noemi, e os filhos Boaz e Obede"],
    0,
    "Elimeleque era casado com Noemi, e seus dois filhos se chamavam Malom e Quiliom.",
    ref(1, 2, 2, "Rute 1:2"),
  ),
  vf(
    "rut-1-3",
    "Malom e Quiliom se casaram com duas mulheres moabitas, chamadas Orfa e Rute.",
    true,
    "Depois da morte de Elimeleque, os dois filhos se casaram com Orfa e Rute, ambas de Moabe.",
    ref(1, 4, 4, "Rute 1:4"),
  ),
  unica(
    "rut-1-4",
    "O que aconteceu com Elimeleque e seus dois filhos ainda em Moabe?",
    ["Os três morreram, deixando Noemi sem marido e sem filhos", "Voltaram sozinhos para Belém", "Enriqueceram e se estabeleceram definitivamente", "Tornaram-se líderes religiosos de Moabe"],
    0,
    "Elimeleque morre logo no início, e anos depois Malom e Quiliom também morrem, deixando Noemi viúva e sem filhos.",
    ref(1, 3, 5, "Rute 1:3-5"),
  ),
  unica(
    "rut-1-5",
    "Ao ser instada por Noemi a voltar para sua terra e seu povo, o que Rute respondeu?",
    ["Que iria com Noemi, pois o povo e o Deus de Noemi seriam também dela", "Que voltaria para Moabe como Orfa", "Que só ficaria se recebesse uma herança", "Que precisava consultar seus pais antes de decidir"],
    0,
    "A declaração de Rute (\"aonde fores irei, e onde pousares pousarei; o teu povo é o meu povo, o teu Deus é o meu Deus\") é uma das mais conhecidas do livro.",
    ref(1, 16, 17, "Rute 1:16-17"),
  ),
];

// ─── Capítulo 2 — Rute cata espigas no campo de Boaz ───────────────────────
const RUTE_2: QuizQuestion[] = [
  unica(
    "rut-2-1",
    "O que Rute foi fazer nos campos para sustentar a si e a Noemi?",
    ["Catar espigas que caíam atrás dos ceifeiros", "Vender artesanato no mercado", "Trabalhar como serva na casa de um sacerdote", "Pastorear ovelhas de um vizinho"],
    0,
    "Rute pede permissão a Noemi para ir catar espigas atrás de quem lhe desse graça aos olhos — o costume de rebusca deixado aos pobres na lei de Israel.",
    ref(2, 2, 3, "Rute 2:2-3"),
  ),
  unica(
    "rut-2-2",
    "De quem era o campo onde Rute \"por acaso\" foi catar espigas?",
    ["De Boaz, parente de Elimeleque", "Do rei de Moabe", "De um sacerdote de Belém", "Do próprio pai de Rute"],
    0,
    "Rute chega, sem saber de antemão, à parte do campo que pertencia a Boaz, parente da família de Elimeleque.",
    ref(2, 3, 3, "Rute 2:3"),
  ),
  vf(
    "rut-2-3",
    "Boaz tratou Rute com bondade porque já tinha ouvido falar da lealdade dela para com Noemi.",
    true,
    "Boaz explica a Rute que soube de tudo o que ela fez por sua sogra desde a morte do marido dela.",
    ref(2, 11, 11, "Rute 2:11"),
  ),
  unica(
    "rut-2-4",
    "O que Boaz instruiu seus moços a fazerem para ajudar Rute discretamente?",
    ["Deixar cair de propósito algumas espigas dos feixes para ela catar", "Dar a ela parte do salário deles", "Contar a todos quem ela era", "Convidá-la para morar na casa de Boaz"],
    0,
    "Boaz ordena aos moços que puxem espigas dos molhos e deixem cair de propósito, sem repreendê-la.",
    ref(2, 15, 16, "Rute 2:15-16"),
  ),
  unica(
    "rut-2-5",
    "Ao saber em que campo Rute havia trabalhado, o que Noemi reconheceu sobre Boaz?",
    ["Que ele era um parente próximo, um dos remidores da família", "Que ele era um estrangeiro recém-chegado a Belém", "Que ele já era casado com outra mulher", "Que ele era inimigo declarado de Elimeleque"],
    0,
    "Noemi identifica Boaz como parente próximo da família, um dos possíveis remidores (resgatadores) segundo o costume de Israel.",
    ref(2, 20, 20, "Rute 2:20"),
  ),
];

// ─── Capítulo 3 — a eira, o pedido de Rute, a promessa de Boaz ─────────────
const RUTE_3: QuizQuestion[] = [
  unica(
    "rut-3-1",
    "O que Noemi orientou Rute a fazer na eira, à noite?",
    ["Lavar-se, perfumar-se e deitar-se aos pés de Boaz depois que ele comesse e bebesse", "Confrontar Boaz publicamente sobre casamento", "Esconder-se e fugir de volta a Moabe", "Pedir dinheiro emprestado a Boaz"],
    0,
    "Noemi orienta Rute a se preparar, ir à eira sem ser notada, e deitar-se aos pés de Boaz somente depois que ele tivesse comido, bebido e estivesse de bom ânimo.",
    ref(3, 3, 4, "Rute 3:3-4"),
  ),
  unica(
    "rut-3-2",
    "O que Rute pediu a Boaz ao ser descoberta aos seus pés, simbolizando o papel de parente-remidor?",
    ["Que ele estendesse sua asa/manto sobre ela", "Que ele a levasse imediatamente para Moabe", "Que ele lhe desse metade de suas terras", "Que ele a apresentasse ao rei"],
    0,
    "Rute pede a Boaz que estenda sua \"asa\" (manto) sobre ela, expressão que invoca o papel de parente-remidor.",
    ref(3, 9, 9, "Rute 3:9"),
  ),
  vf(
    "rut-3-3",
    "Boaz informou a Rute que não havia nenhum outro parente com direito de redenção além dele mesmo.",
    false,
    "Pelo contrário: Boaz revela que existe um parente ainda mais próximo, com prioridade no direito de redenção, e que esse assunto precisaria ser resolvido primeiro.",
    ref(3, 12, 13, "Rute 3:12-13"),
  ),
  unica(
    "rut-3-4",
    "Como Boaz reagiu ao pedido de Rute na eira?",
    ["Elogiou sua bondade/lealdade e prometeu resolver a situação", "Recusou o pedido sem explicação", "Ficou ofendido e a mandou embora imediatamente", "Ignorou o pedido e continuou dormindo"],
    0,
    "Boaz a chama de mulher virtuosa, elogia sua lealdade (maior que a do começo) e promete cuidar do assunto.",
    ref(3, 10, 11, "Rute 3:10-11"),
  ),
  unica(
    "rut-3-5",
    "O que Boaz deu a Rute para levar a Noemi ao final do encontro na eira?",
    ["Seis medidas de cevada", "Uma joia de ouro", "Um cordeiro", "Um pergaminho com a genealogia da família"],
    0,
    "Antes de Rute voltar à cidade, Boaz mede e lhe dá seis medidas de cevada para levar a Noemi.",
    ref(3, 15, 15, "Rute 3:15"),
  ),
];

// ─── Capítulo 4 — o portão da cidade, a redenção, o nascimento de Obede ────
const RUTE_4: QuizQuestion[] = [
  unica(
    "rut-4-1",
    "Onde Boaz foi resolver publicamente o assunto do direito de redenção?",
    ["No portão da cidade, diante dos anciãos", "Dentro do templo", "No campo de trigo", "Na casa de Noemi"],
    0,
    "Boaz sobe ao portão da cidade, senta-se ali, chama o parente mais próximo e reúne dez anciãos como testemunhas.",
    ref(4, 1, 2, "Rute 4:1-2"),
  ),
  unica(
    "rut-4-2",
    "Por que o parente mais próximo recusou redimir a propriedade e casar-se com Rute?",
    ["Porque isso prejudicaria sua própria herança", "Porque ele já era casado", "Porque não conhecia Noemi", "Porque a lei proibia casar com uma moabita"],
    0,
    "O parente diz que não pode redimir para si, para não prejudicar a própria herança, e cede o direito a Boaz.",
    ref(4, 6, 6, "Rute 4:6"),
  ),
  vf(
    "rut-4-3",
    "O costume usado para confirmar publicamente a transferência do direito de redenção foi tirar a sandália e entregá-la ao outro.",
    true,
    "O texto explica esse costume de Israel: para confirmar qualquer negócio de redenção ou troca, um tirava a sandália e a dava ao outro.",
    ref(4, 7, 8, "Rute 4:7-8"),
  ),
  unica(
    "rut-4-4",
    "Qual foi o nome do filho de Boaz e Rute?",
    ["Obede", "Davi", "Jessé", "Malom"],
    0,
    "Rute dá à luz um filho, a quem as mulheres da vizinhança dão o nome de Obede.",
    ref(4, 17, 17, "Rute 4:17"),
  ),
  unica(
    "rut-4-5",
    "Com quem termina a genealogia final do livro de Rute, mostrando a importância maior dessa história?",
    ["Davi, o rei de Israel", "Salomão, filho de Davi", "Abraão, pai da fé", "Moisés, o legislador"],
    0,
    "O livro termina com uma genealogia que vai de Perez até Davi, ligando a história de Rute à linhagem do maior rei de Israel.",
    ref(4, 18, 22, "Rute 4:18-22"),
  ),
];

export const RUTE_QUIZ_CAPITULOS: Record<number, Quiz> = {
  1: { id: "biblia-rut-1", title: "Rute 1 — De Belém a Moabe e de volta", questions: RUTE_1 },
  2: { id: "biblia-rut-2", title: "Rute 2 — Catando espigas no campo de Boaz", questions: RUTE_2 },
  3: { id: "biblia-rut-3", title: "Rute 3 — Um pedido na eira", questions: RUTE_3 },
  4: { id: "biblia-rut-4", title: "Rute 4 — Redenção, casamento e um recém-nascido", questions: RUTE_4 },
};

/**
 * Quiz do LIVRO inteiro — deliberadamente um conjunto de perguntas
 * DIFERENTE das dos 4 quizzes de capítulo (não uma repetição das mesmas 20),
 * misturando estrutura/ordem dos fatos entre capítulos, temas centrais
 * (lealdade, redenção, providência, inclusão de uma estrangeira) e contexto/
 * autoria — diretriz do plano, seção 7. A pergunta de autoria reflete a
 * incerteza real (o texto não se identifica; a tradição judaica antiga
 * sugere Samuel) em vez de afirmar um autor certo — mesmo dado já usado em
 * `data/autoresLivros.ts` (T-041), para não divergir do resto do app.
 */
const RUTE_LIVRO: QuizQuestion[] = [
  unica(
    "rut-l-1",
    "Em que período da história de Israel a narrativa de Rute se passa?",
    ["No período dos juízes", "Durante o exílio babilônico", "No reinado de Salomão", "Na época dos patriarcas (Abraão, Isaque, Jacó)"],
    0,
    "O primeiro versículo do livro situa a história \"nos dias em que os juízes governavam\".",
    ref(1, 1, 1, "Rute 1:1"),
  ),
  vf(
    "rut-l-2",
    "O autor do livro de Rute se identifica pelo nome no próprio texto.",
    false,
    "O livro não identifica seu autor; a tradição judaica antiga sugere Samuel, mas isso não é afirmado pelo texto em si.",
    ref(1, 1, 1, "Rute 1:1"),
  ),
  unica(
    "rut-l-3",
    "Coloque em ordem os principais acontecimentos: o livro de Rute narra, EM SEQUÊNCIA, o(s)...",
    ["Fome/mudança para Moabe → mortes e viuvez → retorno a Belém → catação no campo de Boaz → pedido na eira → redenção no portão", "Redenção no portão → catação no campo → mudança para Moabe → pedido na eira", "Nascimento de Obede → mudança para Moabe → catação no campo → redenção", "Pedido na eira → fome em Belém → catação no campo → mudança para Moabe"],
    0,
    "Essa é a ordem real dos eventos ao longo dos 4 capítulos: fome e mudança (cap. 1), catação no campo (cap. 2), pedido na eira (cap. 3), resolução no portão da cidade (cap. 4).",
    ref(1, 1, 1, "Rute 1–4"),
  ),
  unica(
    "rut-l-4",
    "Qual conceito da lei de Israel estrutura o desfecho do livro (o casamento de Rute com Boaz)?",
    ["O direito/dever do parente-remidor (resgatador)", "A lei do primogênito", "O ano de jubileu", "O voto de nazireu"],
    0,
    "O casamento de Boaz com Rute acontece dentro do costume do parente-remidor, que também redime a propriedade da família.",
    ref(4, 5, 6, "Rute 4:5-6"),
  ),
  unica(
    "rut-l-5",
    "Rute é identificada repetidamente ao longo do livro por sua origem estrangeira. De onde ela era?",
    ["Moabe", "Egito", "Filístia", "Assíria"],
    0,
    "Rute é chamada várias vezes de \"a moabita\" — sua origem estrangeira é um ponto explícito da narrativa, não escondido.",
    ref(1, 22, 22, "Rute 1:22"),
  ),
  unica(
    "rut-l-6",
    "Qual palavra melhor resume a atitude de Rute para com Noemi ao longo de todo o livro?",
    ["Lealdade constante, mesmo sem obrigação legal de permanecer", "Obediência forçada por falta de opção", "Indiferença disfarçada de cortesia", "Rivalidade silenciosa"],
    0,
    "Do capítulo 1 (recusa em abandonar Noemi) ao capítulo 4 (o filho é celebrado como bênção para Noemi), a lealdade voluntária de Rute é o fio condutor do livro.",
    ref(1, 16, 17, "Rute 1:16-17"),
  ),
  unica(
    "rut-l-7",
    "Quem eram os DOIS candidatos possíveis ao papel de parente-remidor de Rute?",
    ["Um parente não nomeado, mais próximo, e Boaz", "Malom e Quiliom, os filhos falecidos de Elimeleque", "Dois irmãos de Boaz", "Obede e Jessé"],
    0,
    "No capítulo 4, existe um parente mais próximo do que Boaz, que tem prioridade no direito de redenção, mas cede esse direito a Boaz.",
    ref(4, 1, 6, "Rute 4:1-6"),
  ),
  unica(
    "rut-l-8",
    "O último capítulo liga a história de Rute a que figura histórica maior de Israel?",
    ["O rei Davi", "O sumo sacerdote Arão", "O juiz Gideão", "O profeta Elias"],
    0,
    "A genealogia final do livro (Perez a Davi) revela que Obede, filho de Rute e Boaz, é avô de Davi.",
    ref(4, 18, 22, "Rute 4:18-22"),
  ),
  unica(
    "rut-l-9",
    "Como as mulheres de Belém reagiram ao nascimento do filho de Rute e Boaz?",
    ["Louvaram a Deus e abençoaram Noemi, dizendo que ela tinha um restaurador de vida", "Ficaram indiferentes, por ser filho de uma estrangeira", "Pediram que a criança fosse levada de volta a Moabe", "Exigiram uma cerimônia de purificação especial"],
    0,
    "As mulheres celebram o nascimento como uma bênção direta para Noemi, chamando o menino de restaurador de sua vida.",
    ref(4, 14, 15, "Rute 4:14-15"),
  ),
  unica(
    "rut-l-10",
    "O que Noemi pediu para ser chamada ao voltar amargurada a Belém, e o que esse nome significa?",
    ["Mara, que significa \"amarga\"", "Sara, que significa \"princesa\"", "Débora, que significa \"abelha\"", "Ana, que significa \"graça\""],
    0,
    "Noemi pede para ser chamada de Mara (\"amarga\"), refletindo a dor de ter perdido marido e filhos.",
    ref(1, 20, 20, "Rute 1:20"),
  ),
];

export const RUTE_QUIZ_LIVRO: Quiz = {
  id: "biblia-rut-livro",
  title: "Rute — o livro inteiro",
  questions: RUTE_LIVRO,
};

export const LIVROS_COM_QUIZ = [LIVRO_ORDER_RUTE];

export function getQuizCapituloBiblia(
  livroOrder: number,
  capitulo: number,
): Quiz | undefined {
  if (livroOrder !== LIVRO_ORDER_RUTE) return undefined;
  return RUTE_QUIZ_CAPITULOS[capitulo];
}

export function getQuizLivroBiblia(livroOrder: number): Quiz | undefined {
  if (livroOrder !== LIVRO_ORDER_RUTE) return undefined;
  return RUTE_QUIZ_LIVRO;
}

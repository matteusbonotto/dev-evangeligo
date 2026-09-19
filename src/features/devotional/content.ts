import type { DevocionalEntry } from "./schemas";

/**
 * Conteúdo estático do Feed de Devocionais (T-013). Curadoria original
 * desta reconstrução — o app legado (`dev-pwa-biblia-game`) não tinha um
 * feed de devocionais equivalente pra portar (diferente de trilhas/quiz/
 * apologética, que migraram conteúdo real do legado — ver regra 29 de
 * `IA/memory/rules.md`), então este conteúdo foi escrito do zero.
 *
 * Cada entrada cita apenas a referência bíblica (livro/capítulo/versículo);
 * o texto do versículo, quando exibido na tela, é buscado ao vivo de
 * `bible/dataLoader.ts` (mesmo padrão já usado no quebra-cabeça, ADR-023) —
 * evita mais uma cópia de texto bíblico enquanto a validação de licença da
 * versão Almeida (ADR-017) segue pendente.
 *
 * Perspectiva teológica: reformada/calvinista — graça soberana, certeza da
 * salvação em Cristo, santificação como FRUTO da graça (nunca como sua
 * causa), coerente com `IA/agents/teologia-reformada.md`. Nenhuma reflexão
 * usa linguagem de mérito espiritual (regra 20) nem teologia da prosperidade.
 * Igual ao padrão já estabelecido para ADR-007/ADR-036: aceito como
 * conteúdo válido, mas a revisão doutrinária FORMAL pelo agente
 * `teologia-reformada` segue recomendada antes do lançamento público.
 */
export const DEVOCIONAIS: DevocionalEntry[] = [
  {
    id: "graca-salvadora",
    titulo: "Uma graça que não se compra",
    tema: "Graça",
    referencia: { livroOrder: 49, capitulo: 2, versiculo: 8, display: "Efésios 2:8" },
    reflexao: [
      "A salvação começa em Deus, não em nós. Não é o esforço religioso, a boa conduta ou o sentimento de fé que nos salva — é a graça de Deus, recebida pela fé, do início ao fim.",
      "Isso tira todo o peso de tentar 'merecer' o amor de Deus e coloca a confiança onde ela pertence: no próprio Deus, que dá o que exige.",
    ],
    aplicacao: "Hoje, descanse: sua posição diante de Deus depende da obra de Cristo, não do seu desempenho.",
  },
  {
    id: "palavra-lampada",
    titulo: "Luz para o próximo passo",
    tema: "A Palavra",
    referencia: { livroOrder: 19, capitulo: 119, versiculo: 105, display: "Salmos 119:105" },
    reflexao: [
      "A Palavra de Deus raramente ilumina todo o caminho de uma vez — ela ilumina o passo seguinte, como uma lâmpada nos pés de quem caminha à noite.",
      "Isso é um convite à leitura constante, não apressada: não precisamos entender o plano inteiro para confiar no próximo passo que a Escritura já deixou claro.",
    ],
    aplicacao: "Antes de decidir algo importante hoje, pergunte o que a Escritura já revelou sobre isso.",
  },
  {
    id: "fidelidade-renovada",
    titulo: "Misericórdias novas a cada manhã",
    tema: "Fidelidade de Deus",
    referencia: { livroOrder: 25, capitulo: 3, versiculo: 23, display: "Lamentações 3:23" },
    reflexao: [
      "Este versículo nasce em meio ao livro mais triste da Bíblia — um lamento sobre a destruição de Jerusalém. E é exatamente ali, no meio da dor, que o autor lembra: a fidelidade de Deus não se esgota.",
      "Se a esperança resiste até no Lamento, ela não depende das nossas circunstâncias mudarem primeiro — depende do caráter de Deus, que não muda.",
    ],
    aplicacao: "Comece o dia reconhecendo uma coisa concreta que continua igual: o caráter fiel de Deus.",
  },
  {
    id: "descanso-em-cristo",
    titulo: "Um convite ao descanso",
    tema: "Descanso",
    referencia: { livroOrder: 40, capitulo: 11, versiculo: 28, display: "Mateus 11:28" },
    reflexao: [
      "Jesus não convida os que já resolveram tudo — convida os cansados e sobrecarregados. O descanso que ele oferece não é ausência de trabalho, mas alívio do peso de tentar se justificar sozinho.",
      "Cansaço espiritual costuma vir de carregar algo que nunca foi nosso pra carregar: a exigência de sermos suficientes por conta própria.",
    ],
    aplicacao: "Identifique um peso que você está carregando sozinho hoje e entregue-o em oração, sem pressa de resolver tudo.",
  },
  {
    id: "sem-condenacao",
    titulo: "Não há mais condenação",
    tema: "Certeza da salvação",
    referencia: { livroOrder: 45, capitulo: 8, versiculo: 1, display: "Romanos 8:1" },
    reflexao: [
      "Depois de sete capítulos descrevendo a luta contra o pecado, Paulo chega a uma conclusão firme: quem está em Cristo Jesus não está mais sob condenação.",
      "A culpa que insiste em voltar depois de um erro real não vem de Deus — para quem está em Cristo, o veredito já foi dado, e é 'não condenado'.",
    ],
    aplicacao: "Se um erro do passado ainda pesa, releia este versículo em voz alta antes de seguir o dia.",
  },
  {
    id: "forca-em-cristo",
    titulo: "Força que não é minha",
    tema: "Confiança",
    referencia: { livroOrder: 50, capitulo: 4, versiculo: 13, display: "Filipenses 4:13" },
    reflexao: [
      "Paulo escreve isso preso, na prisão — não numa vitória, mas em uma limitação real. 'Tudo posso' não é uma promessa de sucesso em qualquer ambição, é a confissão de que ele aprendeu a viver tanto na fartura quanto na escassez, sustentado por Cristo.",
      "É uma promessa sobre suficiência em meio à dificuldade, não sobre não ter dificuldade.",
    ],
    aplicacao: "Leve essa frase para a situação mais difícil da sua semana, não para a mais confortável.",
  },
  {
    id: "amor-na-cruz",
    titulo: "Amado antes de merecer",
    tema: "Amor de Deus",
    referencia: { livroOrder: 45, capitulo: 5, versiculo: 8, display: "Romanos 5:8" },
    reflexao: [
      "Deus prova o seu amor não depois de sermos melhores, mas exatamente enquanto ainda éramos pecadores — Cristo morreu por nós nesse momento, não depois de uma reforma de caráter.",
      "Isso muda a ordem que costumamos assumir: não é 'melhoro para ser amado', é 'sou amado, e por isso posso mudar de verdade'.",
    ],
    aplicacao: "Troque hoje um pensamento de 'preciso merecer isso' por 'já fui amado antes de merecer'.",
  },
  {
    id: "renovacao-entendimento",
    titulo: "Transformados por dentro",
    tema: "Santificação",
    referencia: { livroOrder: 45, capitulo: 12, versiculo: 2, display: "Romanos 12:2" },
    reflexao: [
      "A mudança que a Escritura descreve não é um ajuste de comportamento por fora, mas uma renovação do entendimento — a mente sendo transformada primeiro, o comportamento seguindo depois.",
      "É por isso que a gamificação deste app existe como ferramenta de constância no estudo, nunca como uma pontuação de mérito espiritual: o crescimento espiritual é fruto da graça agindo na mente e no coração, não um placar a vencer.",
    ],
    aplicacao: "Escolha uma verdade bíblica pra repetir mentalmente hoje, em vez de só uma regra de comportamento pra seguir.",
  },
  {
    id: "ansiedade-entregue",
    titulo: "Em nada estejais ansiosos",
    tema: "Ansiedade",
    referencia: { livroOrder: 50, capitulo: 4, versiculo: 6, display: "Filipenses 4:6" },
    reflexao: [
      "O convite não é para fingir que não há motivo de preocupação, mas para trocar a ansiedade pela oração — 'em tudo', com ação de graças, apresentando o pedido real a Deus.",
      "A paz prometida no versículo seguinte não vem de resolver o problema primeiro; ela guarda o coração enquanto o problema ainda está em aberto.",
    ],
    aplicacao: "Escreva uma preocupação concreta de hoje como um pedido de oração específico, não uma preocupação vaga.",
  },
  {
    id: "todas-as-coisas-para-o-bem",
    titulo: "Deus trabalhando no que não escolhemos",
    tema: "Providência",
    referencia: { livroOrder: 45, capitulo: 8, versiculo: 28, display: "Romanos 8:28" },
    reflexao: [
      "A promessa não é que tudo que acontece é bom em si mesmo, mas que Deus opera em todas as coisas — inclusive nas difíceis — para o bem dos que o amam, segundo o seu propósito.",
      "É uma palavra para depois do fato, não uma explicação fácil no meio da dor: a certeza é sobre o caráter de Deus na história, não sobre entender cada evento no momento em que ele acontece.",
    ],
    aplicacao: "Pense em uma dificuldade passada onde, olhando para trás, você já consegue ver algum bem que Deus trouxe dela.",
  },
  {
    id: "eleicao-para-santidade",
    titulo: "Escolhidos para um propósito de amor",
    tema: "Graça soberana",
    referencia: { livroOrder: 49, capitulo: 1, versiculo: 4, display: "Efésios 1:4" },
    reflexao: [
      "Paulo escreve que Deus nos escolheu 'antes da fundação do mundo' — não como resposta a algo que faríamos, mas como iniciativa dele, movida por amor, para que fôssemos santos e irrepreensíveis diante dele.",
      "Essa doutrina não deve gerar orgulho de quem foi escolhido, nem ansiedade sobre quem foi — ela existe na Escritura como consolo: a salvação nunca dependeu da nossa constância, mas da decisão firme de Deus.",
    ],
    aplicacao: "Se você duvida da sua fé hoje, lembre que ela começou pela iniciativa de Deus, não pela sua própria força de vontade.",
  },
  {
    id: "confianca-no-senhor",
    titulo: "Não se apoie apenas no que você entende",
    tema: "Confiança",
    referencia: { livroOrder: 20, capitulo: 3, versiculo: 5, display: "Provérbios 3:5" },
    reflexao: [
      "Confiar de todo o coração e não se apoiar no próprio entendimento não é um chamado ao anti-intelectualismo — é o reconhecimento de que nosso entendimento é limitado, e o de Deus, não.",
      "Há decisões em que o caminho mais sábio é justamente admitir que não temos todas as respostas, e seguir confiando mesmo assim.",
    ],
    aplicacao: "Numa decisão em aberto agora, anote o que você sabe com certeza e o que ainda precisa confiar a Deus.",
  },
];

export function getDevocionalById(id: string): DevocionalEntry | undefined {
  return DEVOCIONAIS.find((entry) => entry.id === id);
}

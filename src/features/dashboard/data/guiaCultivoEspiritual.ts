/**
 * Guia de cultivo espiritual — Fruto do Espírito × Obra da Carne (Gálatas
 * 5:16-23 / 5:19-21), migrado de `dev-pwa-biblia-game/public/game/assets/js/
 * dados/estudoEvangelho.js` (`GUIA_CULTIVO_ESPIRITUAL`). Pedido explícito do
 * usuário (auditoria completa, item 4/5): unir conceito + identificação +
 * exemplo + aplicação prática num só lugar por item, reaproveitando o
 * conteúdo do legado (mais claro e didático que uma definição teológica
 * abstrata) — inclusive os exemplos de "o que seria feitiçaria hoje em dia".
 *
 * Conteúdo puramente educacional — NÃO tem relação com os par_id/fleshLabel
 * usados pelo check-in real (`vidaInterior.ts`/`paresVidaInterior.ts`), que
 * usa outro agrupamento (ex.: Mansidão×Feitiçaria em vez de Bondade×
 * Feitiçaria como aqui). Mudar esse agrupamento pra bater exatamente com o
 * legado invalidaria o texto das 126 situações do check-in (T-061), já
 * escritas pro agrupamento atual — os 2 propósitos ficam deliberadamente
 * separados: aqui é o glossário/guia educacional completo (fiel ao
 * agrupamento original do legado), ali é o dado real rastreado por
 * check-in.
 */
export interface GuiaCultivoItem {
  fruto: string;
  /** O que o fruto significa — definição em linguagem simples, não teológica abstrata. */
  significadoFruto: string;
  /** Um exemplo concreto de como o fruto aparece (ou deixa de aparecer) numa situação real. */
  exemploFruto: string;
  obra: string;
  /** O que a obra da carne significa — definição em linguagem simples. */
  significadoObra: string;
  versiculo: string;
  /** Prática concreta para cultivar o fruto no dia a dia. */
  pratica: string;
  /** Pergunta de autoexame. */
  pergunta: string;
  oracao: string;
  /** Como a obra da carne se manifesta hoje em dia — o "sinal de alerta", com exemplos contemporâneos. */
  sinal: string;
  /** O que fazer ao perceber o sinal — como evitar ficar na obra da carne. */
  resposta: string;
}

export const GUIA_CULTIVO_ESPIRITUAL: GuiaCultivoItem[] = [
  {
    fruto: "Amor",
    significadoFruto:
      "Amor é buscar ativamente o bem do outro, mesmo quando isso custa algo a você.",
    exemploFruto:
      "Um colega leva o crédito por algo que você fez — amor busca resolver com paciência em vez de guardar mágoa.",
    obra: "Ódio",
    significadoObra:
      "Ódio é alimentar hostilidade contra alguém, tratando-o como adversário em vez de buscar reconciliação.",
    versiculo: "1 Coríntios 13:4-7",
    pratica: "Faça uma ação concreta pelo bem de alguém sem esperar reconhecimento.",
    pergunta: "Quem precisa receber de mim paciência, serviço ou perdão hoje?",
    oracao: "Espírito Santo, ensina-me a amar com atitudes e verdade.",
    sinal: "Repassar uma ofensa, alimentar hostilidade ou desejar o mal de alguém.",
    resposta:
      "Interrompa a reação, ore pela pessoa e escolha uma atitude de reconciliação possível e segura.",
  },
  {
    fruto: "Alegria",
    significadoFruto:
      "Alegria no Espírito é uma firmeza interior que não depende das circunstâncias.",
    exemploFruto:
      "Um amigo recebe uma conquista que você também queria — alegria comemora de coração, mesmo sentindo o desejo.",
    obra: "Inveja",
    significadoObra:
      "Inveja é comparar sua vida com a do outro até sentir que o bem dele te tira algo.",
    versiculo: "Filipenses 4:4-6",
    pratica: "Anote três motivos de gratidão e celebre sinceramente uma conquista de outra pessoa.",
    pergunta: "O que Deus já me deu que a comparação está escondendo?",
    oracao: "Senhor, firma minha alegria em ti e livra-me da comparação.",
    sinal: "Comparar trajetórias, diminuir a conquista alheia ou sentir tristeza pelo bem do outro.",
    resposta:
      "Nomeie a comparação, agradeça pelo que recebeu e abençoe intencionalmente a outra pessoa.",
  },
  {
    fruto: "Paz",
    significadoFruto:
      "Paz é a disposição ativa de buscar reconciliação em vez de alimentar conflito.",
    exemploFruto:
      "Uma discussão boba em família esquenta — paz escolhe ceder ou mudar de assunto em vez de vencer a discussão.",
    obra: "Discórdia",
    significadoObra:
      "Discórdia é insistir em ter a última palavra, espalhando versões e prolongando um conflito.",
    versiculo: "Romanos 12:18",
    pratica: "Dê hoje um passo de paz: escute antes de responder ou esclareça um mal-entendido.",
    pergunta: "Minha próxima fala vai pacificar, esclarecer ou apenas vencer a discussão?",
    oracao: "Deus de paz, guarda minhas palavras e faz de mim instrumento de reconciliação.",
    sinal: "Espalhar versões, prolongar discussões ou insistir em ter a última palavra.",
    resposta:
      "Reduza o tom, confirme o que entendeu e proponha uma conversa direta sem exposição pública.",
  },
  {
    fruto: "Longanimidade",
    significadoFruto:
      "Longanimidade é suportar com paciência uma situação ou pessoa difícil, sem explodir.",
    exemploFruto:
      "Alguém te interrompe pela terceira vez numa reunião — longanimidade respira e continua ouvindo.",
    obra: "Ira",
    significadoObra:
      "Ira é a reação imediata e descontrolada à frustração, muitas vezes ferindo com palavras.",
    versiculo: "Tiago 1:19-20",
    pratica: "Antes de uma resposta difícil, faça uma pausa, respire e ore por sabedoria.",
    pergunta: "O que muda se eu responder depois de ouvir e compreender?",
    oracao: "Senhor, dá-me paciência para não transformar pressão em ferida.",
    sinal: "Aceleração do corpo, tom de voz subindo, sarcasmo ou vontade de ferir com palavras.",
    resposta:
      "Afaste-se por alguns minutos quando for seguro, ore e retome a conversa sem agressão.",
  },
  {
    fruto: "Benignidade",
    significadoFruto:
      "Benignidade é bondade ativa — fazer o bem de propósito, mesmo a quem talvez não mereça.",
    exemploFruto:
      "Alguém que já te decepcionou pede ajuda — benignidade oferece o que é possível, sem exigir mérito.",
    obra: "Imoralidade",
    significadoObra:
      "Imoralidade é permitir que o corpo e as relações sejam tratados como objeto, não como algo a honrar.",
    versiculo: "1 Coríntios 6:18-20",
    pratica:
      "Trate seu corpo e o corpo do próximo com honra; remova hoje um estímulo que alimenta impureza.",
    pergunta: "Esta escolha honra a Deus, a mim e a dignidade da outra pessoa?",
    oracao: "Espírito Santo, forma em mim pureza, respeito e bondade.",
    sinal:
      "Transformar pessoas em objeto, esconder hábitos ou permanecer em ambientes que alimentam a tentação.",
    resposta:
      "Saia do estímulo, procure apoio maduro e confiável e substitua o hábito por uma ação saudável.",
  },
  {
    fruto: "Bondade",
    significadoFruto:
      "Bondade é integridade de caráter — ser genuinamente bom, mesmo quando ninguém está olhando.",
    exemploFruto:
      "Você recebe troco a mais sem ninguém perceber — bondade devolve o valor, mesmo sem plateia.",
    obra: "Feitiçaria",
    significadoObra:
      "Feitiçaria é buscar controlar pessoas, resultados ou o futuro por meios que substituem a confiança em Deus — hoje aparece em horóscopo, videntes, amuletos, jogos de sorte ou manipular decisões dos outros.",
    versiculo: "Miquéias 6:8",
    pratica: "Escolha uma ação justa e generosa que não dependa de controle, troca ou manipulação.",
    pergunta: "Estou servindo com integridade ou tentando controlar o resultado e as pessoas?",
    oracao: "Deus, guia-me pela tua verdade e torna minhas intenções íntegras.",
    sinal:
      "Buscar controle espiritual, manipular decisões ou recorrer a práticas contrárias à confiança em Deus (horóscopo, videntes, amuletos, sorte).",
    resposta:
      "Interrompa a prática, procure orientação bíblica responsável e aja com verdade, oração e transparência.",
  },
  {
    fruto: "Fidelidade",
    significadoFruto:
      "Fidelidade é lealdade constante a Deus e aos compromissos assumidos, mesmo sem cobrança.",
    exemploFruto:
      "Uma semana corrida deixa pouco tempo livre — fidelidade ainda reserva um momento pra Deus, mesmo curto.",
    obra: "Idolatria",
    significadoObra:
      "Idolatria é colocar qualquer coisa — dinheiro, aprovação, conforto, uma pessoa — no lugar que pertence só a Deus.",
    versiculo: "Mateus 6:33",
    pratica: "Separe um tempo real para Deus antes da atividade que mais disputa sua atenção.",
    pergunta: "O que tem recebido minha confiança, tempo e obediência acima de Deus?",
    oracao: "Senhor, realinha minhas prioridades e conserva meu coração fiel.",
    sinal: "Uma pessoa, conquista, bem ou hábito se torna indispensável para identidade e segurança.",
    resposta:
      "Reconheça o lugar indevido, estabeleça um limite prático e renove sua prioridade por Deus.",
  },
  {
    fruto: "Mansidão",
    significadoFruto:
      "Mansidão é força sob controle — poder de resposta contido por escolha, não fraqueza.",
    exemploFruto:
      "Você conversa com alguém que pensa muito diferente de você — mansidão busca entender antes de corrigir.",
    obra: "Sectarismo",
    significadoObra:
      "Sectarismo é rotular quem pensa diferente como inimigo, formando grupos pela hostilidade em vez da verdade com amor.",
    versiculo: "Efésios 4:2-3",
    pratica: "Converse com alguém diferente de você buscando compreender antes de corrigir.",
    pergunta: "Consigo defender a verdade sem desprezar quem pensa diferente?",
    oracao: "Jesus, dá-me firmeza humilde e amor pela unidade do teu povo.",
    sinal: "Rotular pessoas, tratar diferenças como superioridade ou formar grupos pela hostilidade.",
    resposta:
      "Recuse o rótulo, escute a pessoa e trate a divergência com verdade, humildade e limites saudáveis.",
  },
  {
    fruto: "Domínio Próprio",
    significadoFruto:
      "Domínio próprio é a capacidade de dizer não a um impulso, mesmo quando ele é forte.",
    exemploFruto:
      "Depois de um dia difícil, bate vontade de exagerar em algo — domínio próprio reconhece o impulso e escolhe um limite.",
    obra: "Excessos",
    significadoObra:
      "Excessos é ceder repetidamente a um impulso (comida, telas, gastos, bebida) até perder o controle sobre ele.",
    versiculo: "1 Coríntios 6:12",
    pratica:
      "Escolha um limite claro para hoje em algo que costuma controlar seu tempo, corpo ou atenção.",
    pergunta: "Eu governo este hábito ou ele já está governando minhas escolhas?",
    oracao: "Espírito Santo, dá-me liberdade para dizer sim ao bem e não ao excesso.",
    sinal:
      "Perder a medida, esconder consumo ou não conseguir interromper um hábito apesar das consequências.",
    resposta:
      "Defina um limite verificável, remova o acesso fácil e peça acompanhamento se não conseguir parar sozinho.",
  },
];

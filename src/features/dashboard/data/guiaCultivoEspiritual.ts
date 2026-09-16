/**
 * Guia de cultivo espiritual — Fruto do Espírito × Obra da Carne (Gálatas
 * 5:16-23), migrado de `dev-pwa-biblia-game/public/game/assets/js/dados/
 * estudoEvangelho.js` (`GUIA_CULTIVO_ESPIRITUAL`). Pedido explícito do
 * usuário: "preciso que tenha os exemplos igual no legado de o que seria
 * feitiçaria hoje em dia... lá tava mais claro e explicativo" + "explicação
 * de como conseguir evitar ficar na obra da carne na vida real".
 *
 * Conteúdo puramente educacional — NÃO tem relação com os par_id/fleshLabel
 * usados pelo check-in real (`vidaInterior.ts`/`paresVidaInterior.ts`), que
 * usa outro agrupamento (ex.: Mansidão×Feitiçaria em vez de Bondade×
 * Feitiçaria como aqui) — mudar esse agrupamento para bater exatamente com
 * o legado invalidaria dados de check-in já existentes de contas reais,
 * então os 2 propósitos ficam deliberadamente separados: aqui é só o
 * "como identificar e evitar hoje em dia", ali é o dado real rastreado.
 */
export interface GuiaCultivoItem {
  fruto: string;
  obra: string;
  versiculo: string;
  /** Prática concreta para cultivar o fruto no dia a dia. */
  pratica: string;
  /** Pergunta de autoexame. */
  pergunta: string;
  oracao: string;
  /** Como a obra da carne se manifesta hoje em dia — o "sinal de alerta". */
  sinal: string;
  /** O que fazer ao perceber o sinal — como evitar ficar na obra da carne. */
  resposta: string;
}

export const GUIA_CULTIVO_ESPIRITUAL: GuiaCultivoItem[] = [
  {
    fruto: "Amor",
    obra: "Ódio",
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
    obra: "Inveja",
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
    obra: "Discórdia",
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
    obra: "Ira",
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
    obra: "Imoralidade",
    versiculo: "1 Coríntios 6:18-20",
    pratica:
      "Trate seu corpo e o corpo do próximo com honra; remova hoje um estímulo que alimenta impureza.",
    pergunta: "Esta escolha honra a Deus, a mim e a dignidade da outra pessoa?",
    oracao: "Espírito Santo, forma em mim pureza, respeito e bondade.",
    sinal: "Transformar pessoas em objeto, esconder hábitos ou permanecer em ambientes que alimentam a tentação.",
    resposta:
      "Saia do estímulo, procure apoio maduro e confiável e substitua o hábito por uma ação saudável.",
  },
  {
    fruto: "Bondade",
    obra: "Feitiçaria",
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
    obra: "Idolatria",
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
    obra: "Sectarismo",
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
    obra: "Excessos",
    versiculo: "1 Coríntios 6:12",
    pratica: "Escolha um limite claro para hoje em algo que costuma controlar seu tempo, corpo ou atenção.",
    pergunta: "Eu governo este hábito ou ele já está governando minhas escolhas?",
    oracao: "Espírito Santo, dá-me liberdade para dizer sim ao bem e não ao excesso.",
    sinal: "Perder a medida, esconder consumo ou não conseguir interromper um hábito apesar das consequências.",
    resposta:
      "Defina um limite verificável, remova o acesso fácil e peça acompanhamento se não conseguir parar sozinho.",
  },
];

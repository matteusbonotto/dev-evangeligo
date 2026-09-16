/**
 * Catálogo dos 9 pares Fruto do Espírito × Obra da Carne (Gálatas 5:16-23) —
 * extraído de `demoUser.ts` (T-059/ADR-051) pra ser a MESMA fonte usada
 * tanto pelo conteúdo estático da conta demonstração quanto pelo cálculo
 * real de "Vida Interior" das contas autenticadas (`vidaInterior.ts`). Só a
 * metadata (rótulos/explicação/exemplo) mora aqui — os VALORES
 * (`fruitValue`/`fleshValue`) são diferentes em cada caso: fixos pra demo,
 * calculados a partir de check-ins reais pra conta autenticada.
 *
 * Campos ricos (versiculo/significadoFruto/exemploFruto/pratica/pergunta/
 * oracao/significadoObra/sinalObra/respostaObra, T-065): pedido do usuário
 * pra o resumo de Vida Interior (`SpiritBattle.tsx`) mostrar o mesmo
 * conteúdo unificado do guia (`guiaCultivoEspiritual.ts`, legado), por par —
 * não só a frase curta de `explicacao`/`exemploDoDia` (mantida como está,
 * ainda usada pelo MODAL de check-in em `CheckinVidaInterior.tsx`).
 *
 * Reconciliação com o legado: os 9 FRUTOS batem 1:1, mesma ordem e mesmas
 * palavras nos dois catálogos — copiados direto. As 9 OBRAS DA CARNE não
 * batem (`guiaCultivoEspiritual.ts` já documentava isso: "usa outro
 * agrupamento"), então cada obra abaixo foi remapeada pelo NOME, não pelo
 * slot: Ira e Idolatria já usavam o mesmo par no legado (copiados sem
 * mudança); Inveja e Feitiçaria existem no legado com a palavra idêntica,
 * só em outro par (reaproveitadas aqui tal como estão); Inimizade,
 * Divisão, Contenda, Impureza e Excessos não têm uma obra IDÊNTICA no
 * legado — usaram o conteúdo do sinônimo mais próximo (Ódio, Sectarismo,
 * Discórdia, Imoralidade, Excessos, respectivamente), com o texto ajustado
 * pra mencionar os dois nomes quando fazia sentido (mesmo critério pedido
 * pelo usuário pro caso "Ira/raiva são a mesma coisa, agrupe"). Nada foi
 * inventado sem base no legado — cada obra abaixo tem uma origem rastreável
 * em `GUIA_CULTIVO_ESPIRITUAL`.
 */
export interface ParVidaInterior {
  id: string;
  fruitLabel: string;
  fleshLabel: string;
  /** O que o par significa e por que fruto e obra se opõem (Gl 5:16-23). Usado pelo modal de check-in. */
  explicacao: string;
  /** Uma situação comum do dia a dia em que o contraste aparece na prática. Usado pelo modal de check-in. */
  exemploDoDia: string;
  versiculo: string;
  significadoFruto: string;
  exemploFruto: string;
  pratica: string;
  pergunta: string;
  oracao: string;
  significadoObra: string;
  sinalObra: string;
  respostaObra: string;
}

export const PARES_VIDA_INTERIOR: ParVidaInterior[] = [
  {
    id: "amor",
    fruitLabel: "Amor",
    fleshLabel: "Inimizade",
    explicacao:
      "Amor é buscar o bem do outro mesmo quando custa algo a você (1 Coríntios 13:4-7). Inimizade é o oposto: tratar o outro como adversário, guardando mágoa em vez de buscar reconciliação.",
    exemploDoDia:
      "Um colega de trabalho leva o crédito por algo que você fez. Amor responde com paciência e busca resolver a conversa diretamente; inimizade responde espalhando fofoca ou tratando a pessoa com frieza depois disso.",
    versiculo: "1 Coríntios 13:4-7",
    significadoFruto:
      "Amor é buscar ativamente o bem do outro, mesmo quando isso custa algo a você.",
    exemploFruto:
      "Um colega leva o crédito por algo que você fez — amor busca resolver com paciência em vez de guardar mágoa.",
    pratica: "Faça uma ação concreta pelo bem de alguém sem esperar reconhecimento.",
    pergunta: "Quem precisa receber de mim paciência, serviço ou perdão hoje?",
    oracao: "Espírito Santo, ensina-me a amar com atitudes e verdade.",
    significadoObra:
      "Inimizade (também chamada de ódio) é alimentar hostilidade contra alguém, tratando-o como adversário em vez de buscar reconciliação.",
    sinalObra: "Repassar uma ofensa, alimentar hostilidade ou desejar o mal de alguém.",
    respostaObra:
      "Interrompa a reação, ore pela pessoa e escolha uma atitude de reconciliação possível e segura.",
  },
  {
    id: "alegria",
    fruitLabel: "Alegria",
    fleshLabel: "Divisão",
    explicacao:
      "Alegria no Espírito é uma firmeza interior que não depende das circunstâncias (Filipenses 4:4). Divisão nasce de comparação e competição, fragmentando relacionamentos em vez de celebrar o bem do outro.",
    exemploDoDia:
      "Um amigo da igreja recebe uma conquista que você também queria. Alegria comemora com ele de coração; divisão puxa o grupo pra «time contra time», comentando por trás quem «merecia mais».",
    versiculo: "Filipenses 4:4-6",
    significadoFruto:
      "Alegria no Espírito é uma firmeza interior que não depende das circunstâncias.",
    exemploFruto:
      "Um amigo recebe uma conquista que você também queria — alegria comemora de coração, mesmo sentindo o desejo.",
    pratica: "Anote três motivos de gratidão e celebre sinceramente uma conquista de outra pessoa.",
    pergunta: "O que Deus já me deu que a comparação está escondendo?",
    oracao: "Senhor, firma minha alegria em ti e livra-me da comparação.",
    significadoObra:
      "Divisão é tratar quem «venceu» ou pensa diferente como rival, formando panelinhas pela comparação em vez de celebrar o bem do outro.",
    sinalObra: "Rotular pessoas por comparação, tratar a conquista alheia como ameaça ou formar grupos pela rivalidade.",
    respostaObra:
      "Recuse o rótulo, celebre o outro de verdade e escolha proximidade em vez de comparação.",
  },
  {
    id: "paz",
    fruitLabel: "Paz",
    fleshLabel: "Contenda",
    explicacao:
      "Paz é a disposição de buscar reconciliação e não alimentar conflito (Romanos 12:18). Contenda é o impulso de discutir, vencer a discussão e provar que o outro está errado, mesmo em assuntos pequenos.",
    exemploDoDia:
      "Uma discussão em família sobre algo bobo (qual caminho pegar, o que assistir) esquenta. Paz cede ou muda de assunto sem precisar «ganhar»; contenda insiste no ponto até a conversa virar briga.",
    versiculo: "Romanos 12:18",
    significadoFruto:
      "Paz é a disposição ativa de buscar reconciliação em vez de alimentar conflito.",
    exemploFruto:
      "Uma discussão boba em família esquenta — paz escolhe ceder ou mudar de assunto em vez de vencer a discussão.",
    pratica: "Dê hoje um passo de paz: escute antes de responder ou esclareça um mal-entendido.",
    pergunta: "Minha próxima fala vai pacificar, esclarecer ou apenas vencer a discussão?",
    oracao: "Deus de paz, guarda minhas palavras e faz de mim instrumento de reconciliação.",
    significadoObra:
      "Contenda (ou discórdia) é insistir em ter a última palavra, espalhando versões e prolongando um conflito.",
    sinalObra: "Espalhar versões, prolongar discussões ou insistir em ter a última palavra.",
    respostaObra:
      "Reduza o tom, confirme o que entendeu e proponha uma conversa direta sem exposição pública.",
  },
  {
    id: "longanimidade",
    fruitLabel: "Longanimidade",
    fleshLabel: "Ira",
    explicacao:
      "Longanimidade (paciência de longo prazo) é suportar uma situação difícil ou uma pessoa irritante sem explodir (Efésios 4:2). Ira é a reação imediata e descontrolada à frustração.",
    exemploDoDia:
      "Alguém te interrompe pela terceira vez numa reunião. Longanimidade respira e continua ouvindo com paciência; ira levanta a voz ou responde de forma ríspida na hora.",
    versiculo: "Tiago 1:19-20",
    significadoFruto:
      "Longanimidade é suportar com paciência uma situação ou pessoa difícil, sem explodir.",
    exemploFruto:
      "Alguém te interrompe pela terceira vez numa reunião — longanimidade respira e continua ouvindo.",
    pratica: "Antes de uma resposta difícil, faça uma pausa, respire e ore por sabedoria.",
    pergunta: "O que muda se eu responder depois de ouvir e compreender?",
    oracao: "Senhor, dá-me paciência para não transformar pressão em ferida.",
    significadoObra:
      "Ira é a reação imediata e descontrolada à frustração, muitas vezes ferindo com palavras.",
    sinalObra: "Aceleração do corpo, tom de voz subindo, sarcasmo ou vontade de ferir com palavras.",
    respostaObra:
      "Afaste-se por alguns minutos quando for seguro, ore e retome a conversa sem agressão.",
  },
  {
    id: "benignidade",
    fruitLabel: "Benignidade",
    fleshLabel: "Inveja",
    explicacao:
      "Benignidade é bondade ativa — fazer o bem de propósito a quem talvez nem mereça (Lucas 6:35). Inveja é ressentir o bem que o outro recebeu, como se isso te tirasse algo.",
    exemploDoDia:
      "Um irmão na fé compra um carro novo ou consegue um emprego melhor. Benignidade se alegra e talvez até ajude ele a comemorar; inveja fica remoendo «por que ele e não eu».",
    versiculo: "Lucas 6:35",
    significadoFruto:
      "Benignidade é bondade ativa — fazer o bem de propósito, mesmo a quem talvez não mereça.",
    exemploFruto:
      "Alguém que já te decepcionou pede ajuda — benignidade oferece o que é possível, sem exigir mérito.",
    pratica: "Ofereça ajuda concreta a alguém que já te decepcionou, sem cobrar nada em troca.",
    pergunta: "Estou fazendo o bem só a quem merece, ou também a quem não merece?",
    oracao: "Senhor, torna minha bondade generosa como a tua comigo.",
    significadoObra:
      "Inveja é comparar sua vida com a do outro até sentir que o bem dele te tira algo.",
    sinalObra: "Comparar trajetórias, diminuir a conquista alheia ou sentir tristeza pelo bem do outro.",
    respostaObra:
      "Nomeie a comparação, agradeça pelo que recebeu e abençoe intencionalmente a outra pessoa.",
  },
  {
    id: "bondade",
    fruitLabel: "Bondade",
    fleshLabel: "Impureza",
    explicacao:
      "Bondade é integridade de caráter — ser genuinamente bom, não só parecer bom (Gálatas 6:9-10). Impureza é permitir pensamentos, palavras ou ações que corrompem esse caráter por dentro, mesmo escondidas dos outros.",
    exemploDoDia:
      "Ninguém está olhando e você poderia levar vantagem numa situação (troco a mais, informação que não é sua). Bondade age certo mesmo sem plateia; impureza aproveita a brecha porque «ninguém vai saber».",
    versiculo: "Gálatas 6:9-10",
    significadoFruto:
      "Bondade é integridade de caráter — ser genuinamente bom, mesmo quando ninguém está olhando.",
    exemploFruto:
      "Você recebe troco a mais sem ninguém perceber — bondade devolve o valor, mesmo sem plateia.",
    pratica: "Escolha uma ação justa e generosa que ninguém além de você vai saber que você fez.",
    pergunta: "Eu sou bom só quando tem plateia, ou também no escondido?",
    oracao: "Deus, forma em mim um caráter que é o mesmo visto ou não visto.",
    significadoObra:
      "Impureza (ou imoralidade) é permitir que o corpo e as relações sejam tratados como objeto, não como algo a honrar.",
    sinalObra:
      "Transformar pessoas em objeto, esconder hábitos ou permanecer em ambientes que alimentam a tentação.",
    respostaObra:
      "Saia do estímulo, procure apoio maduro e confiável e substitua o hábito por uma ação saudável.",
  },
  {
    id: "fidelidade",
    fruitLabel: "Fidelidade",
    fleshLabel: "Idolatria",
    explicacao:
      "Fidelidade é lealdade constante a Deus e aos compromissos assumidos, mesmo quando ninguém cobra (Provérbios 3:3-4). Idolatria é colocar qualquer outra coisa — dinheiro, aprovação, conforto — no lugar que pertence a Deus.",
    exemploDoDia:
      "Uma semana corrida deixa pouco tempo livre. Fidelidade ainda reserva um tempo pra oração/leitura mesmo que curto; idolatria enche esse mesmo tempo de trabalho ou redes sociais e empurra Deus pro que sobrar.",
    versiculo: "Mateus 6:33",
    significadoFruto:
      "Fidelidade é lealdade constante a Deus e aos compromissos assumidos, mesmo sem cobrança.",
    exemploFruto:
      "Uma semana corrida deixa pouco tempo livre — fidelidade ainda reserva um momento pra Deus, mesmo curto.",
    pratica: "Separe um tempo real para Deus antes da atividade que mais disputa sua atenção.",
    pergunta: "O que tem recebido minha confiança, tempo e obediência acima de Deus?",
    oracao: "Senhor, realinha minhas prioridades e conserva meu coração fiel.",
    significadoObra:
      "Idolatria é colocar qualquer coisa — dinheiro, aprovação, conforto, uma pessoa — no lugar que pertence só a Deus.",
    sinalObra: "Uma pessoa, conquista, bem ou hábito se torna indispensável para identidade e segurança.",
    respostaObra:
      "Reconheça o lugar indevido, estabeleça um limite prático e renove sua prioridade por Deus.",
  },
  {
    id: "mansidao",
    fruitLabel: "Mansidão",
    fleshLabel: "Feitiçaria",
    explicacao:
      "Mansidão é força sob controle — poder de resposta contido por escolha, não fraqueza (Mateus 5:5). Feitiçaria (no sentido amplo de Gálatas 5:20, buscar controlar pessoas ou circunstâncias por meios indevidos) é a tentativa de manipular pra conseguir o que quer, em vez de confiar e ceder.",
    exemploDoDia:
      "Você quer convencer alguém de algo importante. Mansidão apresenta o argumento com respeito e aceita um «não»; manipulação usa culpa, pressão ou meias-verdades pra forçar o resultado que quer.",
    versiculo: "Mateus 5:5",
    significadoFruto:
      "Mansidão é força sob controle — poder de resposta contido por escolha, não fraqueza.",
    exemploFruto:
      "Você conversa com alguém que pensa muito diferente de você — mansidão busca entender antes de corrigir.",
    pratica: "Converse com alguém diferente de você buscando compreender antes de corrigir.",
    pergunta: "Consigo defender a verdade sem desprezar quem pensa diferente?",
    oracao: "Jesus, dá-me firmeza humilde e amor pela unidade do teu povo.",
    significadoObra:
      "Feitiçaria é buscar controlar pessoas, resultados ou o futuro por meios que substituem a confiança em Deus — hoje aparece em horóscopo, videntes, amuletos, jogos de sorte ou manipular decisões dos outros.",
    sinalObra:
      "Buscar controle espiritual, manipular decisões ou recorrer a práticas contrárias à confiança em Deus (horóscopo, videntes, amuletos, sorte).",
    respostaObra:
      "Interrompa a prática, procure orientação bíblica responsável e aja com verdade, oração e transparência.",
  },
  {
    id: "dominio-proprio",
    fruitLabel: "Domínio Próprio",
    fleshLabel: "Excessos",
    explicacao:
      "Domínio próprio é a capacidade de dizer não a um impulso mesmo quando ele é forte (1 Coríntios 9:25-27). Excessos (comida, bebida, gastos, tempo de tela — todo excesso que tira o controle sobre si mesmo) é ceder ao impulso até perder esse controle.",
    exemploDoDia:
      "Depois de um dia difícil, bate vontade de exagerar em alguma coisa — comida, bebida, gastos, tempo de tela. Domínio próprio reconhece o impulso e escolhe um limite; excesso deixa o impulso decidir por você.",
    versiculo: "1 Coríntios 6:12",
    significadoFruto:
      "Domínio próprio é a capacidade de dizer não a um impulso, mesmo quando ele é forte.",
    exemploFruto:
      "Depois de um dia difícil, bate vontade de exagerar em algo — domínio próprio reconhece o impulso e escolhe um limite.",
    pratica:
      "Escolha um limite claro para hoje em algo que costuma controlar seu tempo, corpo ou atenção.",
    pergunta: "Eu governo este hábito ou ele já está governando minhas escolhas?",
    oracao: "Espírito Santo, dá-me liberdade para dizer sim ao bem e não ao excesso.",
    significadoObra:
      "Excessos é ceder repetidamente a um impulso (comida, telas, gastos, bebida) até perder o controle sobre ele.",
    sinalObra:
      "Perder a medida, esconder consumo ou não conseguir interromper um hábito apesar das consequências.",
    respostaObra:
      "Defina um limite verificável, remova o acesso fácil e peça acompanhamento se não conseguir parar sozinho.",
  },
];

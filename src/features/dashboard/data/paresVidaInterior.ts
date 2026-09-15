/**
 * Catálogo dos 9 pares Fruto do Espírito × Obra da Carne (Gálatas 5:16-23) —
 * extraído de `demoUser.ts` (T-059/ADR-051) pra ser a MESMA fonte usada
 * tanto pelo conteúdo estático da conta demonstração quanto pelo cálculo
 * real de "Vida Interior" das contas autenticadas (`vidaInterior.ts`). Só a
 * metadata (rótulos/explicação/exemplo) mora aqui — os VALORES
 * (`fruitValue`/`fleshValue`) são diferentes em cada caso: fixos pra demo,
 * calculados a partir de check-ins reais pra conta autenticada.
 */
export interface ParVidaInterior {
  id: string;
  fruitLabel: string;
  fleshLabel: string;
  /** O que o par significa e por que fruto e obra se opõem (Gl 5:16-23). */
  explicacao: string;
  /** Uma situação comum do dia a dia em que o contraste aparece na prática. */
  exemploDoDia: string;
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
  },
  {
    id: "alegria",
    fruitLabel: "Alegria",
    fleshLabel: "Divisão",
    explicacao:
      "Alegria no Espírito é uma firmeza interior que não depende das circunstâncias (Filipenses 4:4). Divisão nasce de comparação e competição, fragmentando relacionamentos em vez de celebrar o bem do outro.",
    exemploDoDia:
      "Um amigo da igreja recebe uma conquista que você também queria. Alegria comemora com ele de coração; divisão puxa o grupo pra «time contra time», comentando por trás quem «merecia mais».",
  },
  {
    id: "paz",
    fruitLabel: "Paz",
    fleshLabel: "Contenda",
    explicacao:
      "Paz é a disposição de buscar reconciliação e não alimentar conflito (Romanos 12:18). Contenda é o impulso de discutir, vencer a discussão e provar que o outro está errado, mesmo em assuntos pequenos.",
    exemploDoDia:
      "Uma discussão em família sobre algo bobo (qual caminho pegar, o que assistir) esquenta. Paz cede ou muda de assunto sem precisar «ganhar»; contenda insiste no ponto até a conversa virar briga.",
  },
  {
    id: "longanimidade",
    fruitLabel: "Longanimidade",
    fleshLabel: "Ira",
    explicacao:
      "Longanimidade (paciência de longo prazo) é suportar uma situação difícil ou uma pessoa irritante sem explodir (Efésios 4:2). Ira é a reação imediata e descontrolada à frustração.",
    exemploDoDia:
      "Alguém te interrompe pela terceira vez numa reunião. Longanimidade respira e continua ouvindo com paciência; ira levanta a voz ou responde de forma ríspida na hora.",
  },
  {
    id: "benignidade",
    fruitLabel: "Benignidade",
    fleshLabel: "Inveja",
    explicacao:
      "Benignidade é bondade ativa — fazer o bem de propósito a quem talvez nem mereça (Lucas 6:35). Inveja é ressentir o bem que o outro recebeu, como se isso te tirasse algo.",
    exemploDoDia:
      "Um irmão na fé compra um carro novo ou consegue um emprego melhor. Benignidade se alegra e talvez até ajude ele a comemorar; inveja fica remoendo «por que ele e não eu».",
  },
  {
    id: "bondade",
    fruitLabel: "Bondade",
    fleshLabel: "Impureza",
    explicacao:
      "Bondade é integridade de caráter — ser genuinamente bom, não só parecer bom (Gálatas 6:9-10). Impureza é permitir pensamentos, palavras ou ações que corrompem esse caráter por dentro, mesmo escondidas dos outros.",
    exemploDoDia:
      "Ninguém está olhando e você poderia levar vantagem numa situação (troco a mais, informação que não é sua). Bondade age certo mesmo sem plateia; impureza aproveita a brecha porque «ninguém vai saber».",
  },
  {
    id: "fidelidade",
    fruitLabel: "Fidelidade",
    fleshLabel: "Idolatria",
    explicacao:
      "Fidelidade é lealdade constante a Deus e aos compromissos assumidos, mesmo quando ninguém cobra (Provérbios 3:3-4). Idolatria é colocar qualquer outra coisa — dinheiro, aprovação, conforto — no lugar que pertence a Deus.",
    exemploDoDia:
      "Uma semana corrida deixa pouco tempo livre. Fidelidade ainda reserva um tempo pra oração/leitura mesmo que curto; idolatria enche esse mesmo tempo de trabalho ou redes sociais e empurra Deus pro que sobrar.",
  },
  {
    id: "mansidao",
    fruitLabel: "Mansidão",
    fleshLabel: "Feitiçaria",
    explicacao:
      "Mansidão é força sob controle — poder de resposta contido por escolha, não fraqueza (Mateus 5:5). Feitiçaria (no sentido amplo de Gálatas 5:20, buscar controlar pessoas ou circunstâncias por meios indevidos) é a tentativa de manipular pra conseguir o que quer, em vez de confiar e ceder.",
    exemploDoDia:
      "Você quer convencer alguém de algo importante. Mansidão apresenta o argumento com respeito e aceita um «não»; manipulação usa culpa, pressão ou meias-verdades pra forçar o resultado que quer.",
  },
  {
    id: "dominio-proprio",
    fruitLabel: "Domínio Próprio",
    fleshLabel: "Embriaguez",
    explicacao:
      "Domínio próprio é a capacidade de dizer não a um impulso mesmo quando ele é forte (1 Coríntios 9:25-27). Embriaguez (e todo excesso que tira o controle sobre si mesmo) é ceder ao impulso até perder esse controle.",
    exemploDoDia:
      "Depois de um dia difícil, bate vontade de exagerar em alguma coisa — comida, bebida, gastos, tempo de tela. Domínio próprio reconhece o impulso e escolhe um limite; embriaguez/excesso deixa o impulso decidir por você.",
  },
];

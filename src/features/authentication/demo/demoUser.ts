import { CONFIG_AVATAR_PADRAO } from "../../avatar/avatarUrl";
import type { AvatarConfig } from "../../avatar/types";

export type Rarity = "comum" | "raro" | "epico" | "lendario";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  unlockedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: "permanente" | "consumivel" | "armadura";
  /** Duração do efeito em minutos (apenas consumíveis temporários). */
  durationMinutes?: number;
  /** Timestamp ISO de quando o efeito ativo expira (se ativo). */
  expiresAt?: string;
}

export type EffectType = "passivo" | "reativo";

/**
 * Par Fruto do Espírito × Obra da Carne (Gálatas 5:16-23). As 9 obras da
 * carne são um agrupamento didático das ~17 citadas no texto, para que o
 * jogador tenha a mesma quantidade de itens dos dois lados e possa comparar
 * um a um. Pareamento por contraste (ex.: longanimidade × ira) valida a
 * intenção teológica de "Andai em Espírito, e não haveis de cumprir a
 * concupiscência da carne" (Gl 5:16), não uma equivalência literal do texto.
 */
export interface SpiritBattleEntry {
  id: string;
  fruitLabel: string;
  fruitValue: number;
  fleshLabel: string;
  fleshValue: number;
  /** O que o par significa e por que fruto e obra se opõem (Gl 5:16-23) — pedido do usuário: "mostrando o significado". */
  explicacao: string;
  /** Uma situação comum do dia a dia em que o contraste aparece na prática — pedido do usuário: "mostrando um exemplo do dia a dia". */
  exemploDoDia: string;
}

export interface ArmorSlot {
  slot: "cinto" | "couraca" | "calçados" | "escudo" | "capacete" | "espada";
  name: string;
  equipped: boolean;
  rarity: Rarity;
  level: number;
  effect: string;
  effectType: EffectType;
}

/** Um efeito de consumível em andamento — ver `src/features/rpg/types.ts` (`EfeitoAtivo`, mesmo formato). */
export interface ActiveEffect {
  itemId: string;
  nome: string;
  iniciaEm: string;
  terminaEm: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  /** Configuração do avatar ilustrado (T-053/ADR-046) — mesmo formato usado pelo editor (`avatar/types.ts`). */
  avatarConfig: AvatarConfig;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  streakDays: number;
  bestStreak: number;
  isDemo: boolean;
  achievements: Achievement[];
  inventory: InventoryItem[];
  armor: ArmorSlot[];
  /** Consumíveis em uso agora (T-010) — no máximo `RPG_MAX_EFEITOS_ATIVOS` simultâneos, ver `src/features/rpg/inventario.ts`. */
  effects: ActiveEffect[];
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  hearts: number;
  maxHearts: number;
  spiritBattle: SpiritBattleEntry[];
}

export const demoUser: DemoUser = {
  id: "demo-user",
  name: "Visitante",
  email: "demo@evangeligo.app",
  avatarInitial: "V",
  avatarConfig: CONFIG_AVATAR_PADRAO,
  level: 7,
  xp: 1240,
  xpToNextLevel: 1500,
  gold: 320,
  streakDays: 12,
  bestStreak: 21,
  isDemo: true,
  achievements: [
    {
      // Id igual ao do catálogo real (`gamification/domain/achievements.ts`,
      // "primeiro-passo") — antes desse catálogo existir/ser ligado a este
      // usuário (T-010), este registro usava um id ad hoc ("ach-primeiro-
      // passo") que nunca batia com o do motor de conquistas de verdade.
      // Sem alinhar, `verificarNovasConquistas` (que só evita duplicar pelo
      // id) desbloqueava "Primeiro Passo" de novo, duplicado, na primeira
      // vez que qualquer condição fosse checada — bug real pego ao
      // verificar o fluxo completo em navegador real.
      id: "primeiro-passo",
      title: "Primeiro Passo",
      description: "Concluiu sua primeira aula.",
      rarity: "comum",
      unlockedAt: "2026-08-01",
    },
    {
      // Mesmo motivo do comentário acima — "constancia" é o id real do
      // catálogo pra esta conquista ("Manteve uma sequência de 7 dias.").
      id: "constancia",
      title: "Constância",
      description: "Manteve uma sequência de 7 dias.",
      rarity: "raro",
      unlockedAt: "2026-08-08",
    },
    {
      id: "ach-sola-scriptura",
      title: "Sola Scriptura",
      description: "Concluiu a trilha das Cinco Solas.",
      rarity: "lendario",
      unlockedAt: "2026-08-15",
    },
  ],
  inventory: [
    {
      id: "item-biblia-estudo",
      name: "Bíblia de Estudo",
      description: "Referência permanente das Escrituras.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-catecismo",
      name: "Catecismo de Heidelberg",
      description: "Referência permanente de doutrina.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-calvino",
      name: "Comentário de Calvino",
      description: "Referência permanente de exegese.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-harpa",
      name: "Harpa Cristã",
      description: "Referência permanente de hinos.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-protecao-fe",
      name: "Proteção da Fé",
      description: "Protege 20% dos corações em um quiz.",
      quantity: 3,
      type: "consumivel",
      durationMinutes: 30,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    {
      id: "item-coracao",
      name: "Coração Extra",
      description: "Recupera um coração perdido.",
      quantity: 2,
      type: "consumivel",
    },
    {
      id: "item-foco",
      name: "Poção de Foco",
      description: "Ganha +XP em quizzes.",
      quantity: 2,
      type: "consumivel",
      durationMinutes: 20,
    },
    {
      id: "item-tocha",
      name: "Tocha da Verdade",
      description: "Revela uma dica em um quiz.",
      quantity: 1,
      type: "consumivel",
      durationMinutes: 15,
    },
    {
      id: "item-pao",
      name: "Pão da Vida",
      description: "Recupera energia para continuar.",
      quantity: 4,
      type: "consumivel",
      durationMinutes: 25,
    },
  ],
  armor: [
    {
      slot: "cinto",
      name: "Cinto da Verdade",
      equipped: true,
      rarity: "comum",
      level: 1,
      effect: "+5% de ouro",
      effectType: "passivo",
    },
    {
      slot: "couraca",
      name: "Couraça da Justiça",
      equipped: true,
      rarity: "lendario",
      level: 3,
      effect: "Reduz dano de coração em 30%",
      effectType: "passivo",
    },
    {
      slot: "calçados",
      name: "Calçados do Evangelho",
      equipped: false,
      rarity: "raro",
      level: 1,
      effect: "Sequência não quebra em 1 dia de folga",
      effectType: "passivo",
    },
    {
      slot: "escudo",
      name: "Escudo da Fé",
      equipped: true,
      rarity: "raro",
      level: 2,
      effect: "Bloqueia 1 erro por quiz",
      effectType: "reativo",
    },
    {
      slot: "capacete",
      name: "Capacete da Salvação",
      equipped: true,
      rarity: "epico",
      level: 2,
      effect: "+10% de XP em aulas",
      effectType: "passivo",
    },
    {
      slot: "espada",
      name: "Espada do Espírito",
      equipped: true,
      rarity: "lendario",
      level: 4,
      effect: "A cada 3 acertos, +1 coração",
      effectType: "reativo",
    },
  ],
  effects: [],
  completedLessons: 9,
  totalLessons: 17,
  completedQuizzes: 12,
  totalQuizzes: 35,
  hearts: 5,
  maxHearts: 5,
  spiritBattle: [
    {
      id: "amor",
      fruitLabel: "Amor",
      fruitValue: 78,
      fleshLabel: "Inimizade",
      fleshValue: 22,
      explicacao:
        "Amor é buscar o bem do outro mesmo quando custa algo a você (1 Coríntios 13:4-7). Inimizade é o oposto: tratar o outro como adversário, guardando mágoa em vez de buscar reconciliação.",
      exemploDoDia:
        "Um colega de trabalho leva o crédito por algo que você fez. Amor responde com paciência e busca resolver a conversa diretamente; inimizade responde espalhando fofoca ou tratando a pessoa com frieza depois disso.",
    },
    {
      id: "alegria",
      fruitLabel: "Alegria",
      fruitValue: 70,
      fleshLabel: "Divisão",
      fleshValue: 18,
      explicacao:
        "Alegria no Espírito é uma firmeza interior que não depende das circunstâncias (Filipenses 4:4). Divisão nasce de comparação e competição, fragmentando relacionamentos em vez de celebrar o bem do outro.",
      exemploDoDia:
        "Um amigo da igreja recebe uma conquista que você também queria. Alegria comemora com ele de coração; divisão puxa o grupo pra «time contra time», comentando por trás quem «merecia mais».",
    },
    {
      id: "paz",
      fruitLabel: "Paz",
      fruitValue: 74,
      fleshLabel: "Contenda",
      fleshValue: 20,
      explicacao:
        "Paz é a disposição de buscar reconciliação e não alimentar conflito (Romanos 12:18). Contenda é o impulso de discutir, vencer a discussão e provar que o outro está errado, mesmo em assuntos pequenos.",
      exemploDoDia:
        "Uma discussão em família sobre algo bobo (qual caminho pegar, o que assistir) esquenta. Paz cede ou muda de assunto sem precisar «ganhar»; contenda insiste no ponto até a conversa virar briga.",
    },
    {
      id: "longanimidade",
      fruitLabel: "Longanimidade",
      fruitValue: 60,
      fleshLabel: "Ira",
      fleshValue: 30,
      explicacao:
        "Longanimidade (paciência de longo prazo) é suportar uma situação difícil ou uma pessoa irritante sem explodir (Efésios 4:2). Ira é a reação imediata e descontrolada à frustração.",
      exemploDoDia:
        "Alguém te interrompe pela terceira vez numa reunião. Longanimidade respira e continua ouvindo com paciência; ira levanta a voz ou responde de forma ríspida na hora.",
    },
    {
      id: "benignidade",
      fruitLabel: "Benignidade",
      fruitValue: 68,
      fleshLabel: "Inveja",
      fleshValue: 25,
      explicacao:
        "Benignidade é bondade ativa — fazer o bem de propósito a quem talvez nem mereça (Lucas 6:35). Inveja é ressentir o bem que o outro recebeu, como se isso te tirasse algo.",
      exemploDoDia:
        "Um irmão na fé compra um carro novo ou consegue um emprego melhor. Benignidade se alegra e talvez até ajude ele a comemorar; inveja fica remoendo «por que ele e não eu».",
    },
    {
      id: "bondade",
      fruitLabel: "Bondade",
      fruitValue: 72,
      fleshLabel: "Impureza",
      fleshValue: 15,
      explicacao:
        "Bondade é integridade de caráter — ser genuinamente bom, não só parecer bom (Gálatas 6:9-10). Impureza é permitir pensamentos, palavras ou ações que corrompem esse caráter por dentro, mesmo escondidas dos outros.",
      exemploDoDia:
        "Ninguém está olhando e você poderia levar vantagem numa situação (troco a mais, informação que não é sua). Bondade age certo mesmo sem plateia; impureza aproveita a brecha porque «ninguém vai saber».",
    },
    {
      id: "fidelidade",
      fruitLabel: "Fidelidade",
      fruitValue: 80,
      fleshLabel: "Idolatria",
      fleshValue: 10,
      explicacao:
        "Fidelidade é lealdade constante a Deus e aos compromissos assumidos, mesmo quando ninguém cobra (Provérbios 3:3-4). Idolatria é colocar qualquer outra coisa — dinheiro, aprovação, conforto — no lugar que pertence a Deus.",
      exemploDoDia:
        "Uma semana corrida deixa pouco tempo livre. Fidelidade ainda reserva um tempo pra oração/leitura mesmo que curto; idolatria enche esse mesmo tempo de trabalho ou redes sociais e empurra Deus pro que sobrar.",
    },
    {
      id: "mansidao",
      fruitLabel: "Mansidão",
      fruitValue: 64,
      fleshLabel: "Feitiçaria",
      fleshValue: 12,
      explicacao:
        "Mansidão é força sob controle — poder de resposta contido por escolha, não fraqueza (Mateus 5:5). Feitiçaria (no sentido amplo de Gálatas 5:20, buscar controlar pessoas ou circunstâncias por meios indevidos) é a tentativa de manipular pra conseguir o que quer, em vez de confiar e ceder.",
      exemploDoDia:
        "Você quer convencer alguém de algo importante. Mansidão apresenta o argumento com respeito e aceita um «não»; manipulação usa culpa, pressão ou meias-verdades pra forçar o resultado que quer.",
    },
    {
      id: "dominio-proprio",
      fruitLabel: "Domínio Próprio",
      fruitValue: 58,
      fleshLabel: "Embriaguez",
      fleshValue: 28,
      explicacao:
        "Domínio próprio é a capacidade de dizer não a um impulso mesmo quando ele é forte (1 Coríntios 9:25-27). Embriaguez (e todo excesso que tira o controle sobre si mesmo) é ceder ao impulso até perder esse controle.",
      exemploDoDia:
        "Depois de um dia difícil, bate vontade de exagerar em alguma coisa — comida, bebida, gastos, tempo de tela. Domínio próprio reconhece o impulso e escolhe um limite; embriaguez/excesso deixa o impulso decidir por você.",
    },
  ],
};

import type { TourPasso } from "../../shared/tour/tourTipos";

/**
 * Tour guiado do Dashboard/Início (T-077) — pedido explícito do usuário,
 * com um exemplo passo a passo (nível/ouro/ofensiva/corações/perfil/
 * armadura/avatar/itens). O motor (`shared/tour/`) é reaproveitável pro
 * app inteiro; este é o primeiro conteúdo autoral, outras páginas
 * (Bíblia, Loja, Exercícios) ficam para rodadas futuras.
 */
export const ID_TOUR_DASHBOARD = "dashboard";

export const PASSOS_TOUR_DASHBOARD: TourPasso[] = [
  {
    seletor: '[data-tour="nivel"]',
    titulo: "Seu nível",
    texto:
      "Este é o seu nível. Ele sobe conforme você ganha XP fazendo atividades no app — ler a Bíblia, completar trilhas, responder quizzes e mais.",
  },
  {
    seletor: '[data-tour="ouro"]',
    titulo: "Ouro",
    texto: "Este é o ouro que você ganha jogando. Gaste na Loja para comprar itens.",
  },
  {
    seletor: '[data-tour="ofensiva"]',
    titulo: "Ofensiva",
    texto:
      "Dias seguidos em que você fez alguma atividade no app. Voltar todo dia mantém a sua ofensiva viva.",
  },
  {
    seletor: '[data-tour="coracoes"]',
    titulo: "Corações",
    texto: "Suas vidas nos quizzes. Errar uma pergunta custa 1 coração.",
  },
  {
    seletor: '[data-tour="perfil"]',
    titulo: "Seu perfil",
    texto: "Toque aqui para ver seu perfil, configurações e sair da conta.",
  },
  {
    seletor: '[data-tour="armadura"]',
    titulo: "Armadura de Deus",
    texto:
      "As 6 peças da Armadura de Deus (Efésios 6): cinto da verdade, couraça da justiça, calçados do evangelho, escudo da fé, capacete da salvação e espada do Espírito. Equipe peças pra ganhar bônus.",
  },
  {
    seletor: '[data-tour="avatar-hud"]',
    titulo: "Seu avatar",
    texto:
      "Este é o seu personagem. Toque no lápis para editar o visual — cabelo, roupa, acessórios e muito mais.",
  },
  {
    seletor: '[data-tour="itens"]',
    titulo: "Itens permanentes e consumíveis",
    texto:
      "Itens permanentes (como a Bíblia de Estudo) ficam com você pra sempre. Consumíveis (poções, tochas) têm efeito por tempo limitado e se gastam ao usar.",
  },
];

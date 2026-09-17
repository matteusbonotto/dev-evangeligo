/**
 * Perguntas frequentes (T-077) — pedido explícito do usuário, na mesma
 * rodada do popup de boas-vindas e do tour guiado. Cobre com mais
 * detalhe o que o popup de boas-vindas explica resumidamente
 * (honestidade/privacidade/métricas visíveis), além de perguntas
 * práticas do dia a dia do app.
 */
export interface PerguntaFaq {
  id: string;
  pergunta: string;
  resposta: string;
}

export const PERGUNTAS_FAQ: PerguntaFaq[] = [
  {
    id: "sem-validacao",
    pergunta: "Por que o app não confere se eu realmente li/orei/refleti?",
    resposta:
      "De propósito. O EvangeliGO não existe para te vigiar — existe para te ajudar a criar o hábito. O valor real está na sua honestidade com Deus, que vê tudo, e consigo mesmo(a). Marcar algo como feito sem ter feito de verdade só tira valor da sua própria experiência.",
  },
  {
    id: "o-que-veem",
    pergunta: "O que a equipe do app consegue ver da minha conta?",
    resposta:
      "Só métricas técnicas do jogo: nível, XP, ofensiva (dias seguidos), itens e conquistas. Nunca o conteúdo das suas respostas, reflexões ou orações — isso não é registrado em nenhum lugar acessível a nós.",
  },
  {
    id: "mudar-avatar",
    pergunta: "Como eu mudo meu avatar?",
    resposta:
      "Toque no lápis que aparece sobre o seu personagem, no Início, ou vá em Perfil → Editar avatar. Dá pra mudar cabelo, roupa, acessórios e mais, a qualquer momento.",
  },
  {
    id: "desligar-vlibras",
    pergunta: "Como desligo o ícone do VLibras (tradução em Libras)?",
    resposta:
      "Vá em Perfil → Configurações e desligue o interruptor \"VLibras (tradução em Libras)\". Isso desliga o script inteiro, não só esconde o ícone.",
  },
  {
    id: "notificacoes",
    pergunta: "Como ligo ou desligo as notificações?",
    resposta:
      "Em Perfil → Configurações, o interruptor \"Notificações push\" pede (ou remove) a permissão do seu navegador.",
  },
  {
    id: "refazer-tour",
    pergunta: "Posso ver o tour guiado de novo?",
    resposta:
      "Sim — em Perfil → Configurações, na seção \"Tutorial e ajuda\", tem um botão para refazer o tour do Início quando quiser.",
  },
  {
    id: "contato",
    pergunta: "Como entro em contato com o responsável pelo app?",
    resposta: "Escreva para evangeligogame@gmail.com a qualquer momento.",
  },
];

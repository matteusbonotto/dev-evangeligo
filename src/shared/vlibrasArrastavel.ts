/**
 * Torna o botão de acesso do VLibras (widget oficial de Libras, `index.html`,
 * T-017) arrastável e ancorável nos 4 cantos da tela — feedback real de
 * testadores da versão de teste: "o ícone de acessibilidade atrapalha o
 * uso" (fixo sempre no mesmo canto, sobrepondo botões do app). Continua
 * fora da árvore React de propósito (mesmo motivo já documentado em
 * `index.html`: o script do governo gerencia esse DOM sozinho) — este
 * módulo só observa o botão já renderizado pelo VLibras e adiciona
 * arrastar+ancorar por cima, sem reimplementar nem substituir o widget.
 *
 * Causa raiz real (T-071, achado ao inspecionar o DOM em produção com o
 * usuário): o elemento QUE O WIDGET REALMENTE POSICIONA como flutuante é
 * `#vlibras-access` (`position: fixed; top: calc(50vh - 20px); right:
 * 10px`, CSS do próprio script) — `[vw-access-button]` é só o placeholder
 * estático de `index.html` que o widget deixa de lado depois que carrega
 * de verdade. Toda a correção de T-062/T-065/T-067/T-070 vinha sendo
 * aplicada no elemento ERRADO: funcionava nos meus testes porque o widget
 * real nunca carrega completo em ambiente headless/sandboxed (achado
 * documentado desde o T-062), então o placeholder ficava visível e
 * "parecia" corrigido — mas no celular real, com o widget carregado de
 * verdade, `#vlibras-access` nunca era tocado. Por isso `SELETORES`
 * abaixo tenta os dois IDs conhecidos, na ordem em que o widget
 * provavelmente os usa.
 */

const CHAVE_POSICAO = "evangeligo:vlibras:canto";
type Canto = "top-left" | "top-right" | "bottom-left" | "bottom-right";
const CANTOS: Canto[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
const MARGEM_PX = 16;

/**
 * `#vlibras-access` é o elemento real (versão atual do widget);
 * `[vw-access-button]` é o placeholder estático de `index.html`/versões
 * antigas do widget. CUIDADO: nunca combinar os dois num seletor só
 * (`"#a, [b]"`) — `querySelector` com lista devolve o primeiro em ORDEM NO
 * DOM, e o placeholder estático (declarado antes no HTML) sempre viria
 * primeiro mesmo depois do `#vlibras-access` real existir, fazendo o
 * código nunca "trocar" pro elemento certo. Por isso a busca abaixo tenta
 * o real PRIMEIRO, explicitamente, e só cai pro placeholder se o real
 * ainda não existir.
 */
function encontrarBotaoVLibras(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>("#vlibras-access") ??
    document.querySelector<HTMLElement>("[vw-access-button]")
  );
}

/**
 * O CSS injetado pelo próprio widget do VLibras usa `!important` em
 * `position`/`top`/`left`/`right`/`bottom` (confirmado — é por isso que
 * testadores reportaram o botão "não se move" mesmo com os estilos inline
 * sendo aplicados corretamente pelo script). Um valor inline comum perde
 * pra `!important` de qualquer stylesheet, então cada ajuste de posição
 * precisa ser escrito também com prioridade `important` via
 * `setProperty` — `style.top = ...` sozinho não é suficiente aqui.
 */
function set(botao: HTMLElement, propriedade: string, valor: string): void {
  botao.style.setProperty(propriedade, valor, "important");
}

/**
 * Sempre define os 4 eixos explicitamente (nunca `removeProperty`): como
 * o CSS do próprio widget também tem `top`/`bottom`/`left`/`right` com
 * `!important`, só "limpar" um eixo faria a regra dele reaparecer por
 * baixo — com `position: fixed` e altura intrínseca, ter `top` e `bottom`
 * simultaneamente ativos (um nosso, um dele) esticaria/distorceria o
 * botão em vez de só reposicioná-lo.
 */
function aplicarCanto(botao: HTMLElement, canto: Canto): void {
  set(botao, "position", "fixed");
  set(botao, "top", canto.startsWith("top") ? `${MARGEM_PX}px` : "auto");
  set(botao, "bottom", canto.startsWith("bottom") ? `${MARGEM_PX}px` : "auto");
  set(botao, "left", canto.endsWith("left") ? `${MARGEM_PX}px` : "auto");
  set(botao, "right", canto.endsWith("right") ? `${MARGEM_PX}px` : "auto");
}

function cantoMaisProximo(x: number, y: number): Canto {
  const vertical = y < window.innerHeight / 2 ? "top" : "bottom";
  const horizontal = x < window.innerWidth / 2 ? "left" : "right";
  return `${vertical}-${horizontal}` as Canto;
}

function carregarCantoSalvo(): Canto {
  try {
    const salvo = localStorage.getItem(CHAVE_POSICAO);
    return (CANTOS as string[]).includes(salvo ?? "")
      ? (salvo as Canto)
      : "bottom-right";
  } catch {
    return "bottom-right";
  }
}

function salvarCanto(canto: Canto): void {
  try {
    localStorage.setItem(CHAVE_POSICAO, canto);
  } catch {
    // localStorage indisponível — a posição só não persiste entre sessões.
  }
}

/** Distância mínima de movimento pra contar como arrasto (evita bloquear um toque/clique normal por tremor da mão). */
const LIMIAR_ARRASTO_PX = 6;

/** O canto atual bate com o que `aplicarCanto` teria escrito? Usado pelo observador de estilo pra decidir se algo de FORA mexeu no botão (e precisa ser desfeito) sem entrar em loop com nossas próprias escritas. */
function correspondeAoCanto(botao: HTMLElement, canto: Canto): boolean {
  const esperadoTop = canto.startsWith("top") ? `${MARGEM_PX}px` : "auto";
  const esperadoBottom = canto.startsWith("bottom") ? `${MARGEM_PX}px` : "auto";
  const esperadoLeft = canto.endsWith("left") ? `${MARGEM_PX}px` : "auto";
  const esperadoRight = canto.endsWith("right") ? `${MARGEM_PX}px` : "auto";
  return (
    botao.style.position === "fixed" &&
    botao.style.top === esperadoTop &&
    botao.style.bottom === esperadoBottom &&
    botao.style.left === esperadoLeft &&
    botao.style.right === esperadoRight
  );
}

function tornarArrastavel(botao: HTMLElement): void {
  let cantoAtual = carregarCantoSalvo();
  let arrastando = false;
  let moveu = false;
  let inicioX = 0;
  let inicioY = 0;

  function garantirEstilosBase(): void {
    set(botao, "cursor", arrastando ? "grabbing" : "grab");
    set(botao, "touch-action", "none");
    set(botao, "z-index", "2147483647");
  }

  /**
   * CUIDADO: só escreve estilo quando `correspondeAoCanto` já for falso.
   * Chamar isso incondicionalmente de um observador (mesmo repetindo os
   * MESMOS valores) geraria uma nova mutação de `style` a cada chamada,
   * disparando o próprio observador de novo — loop infinito síncrono via
   * microtask (achado real rodando os testes: a suíte travava sem nunca
   * terminar). Aqui é seguro porque só é chamada a partir de gatilhos
   * externos (observer/rAF), nunca em cadeia consigo mesma.
   */
  function corrigirSeNecessario(): void {
    if (arrastando) return;
    if (!correspondeAoCanto(botao, cantoAtual)) {
      aplicarCanto(botao, cantoAtual);
      garantirEstilosBase();
    }
  }

  aplicarCanto(botao, cantoAtual);
  garantirEstilosBase();

  /**
   * O widget do VLibras inicializa DEPOIS do nosso script (ver comentário
   * no topo do arquivo) e reaplica a própria posição por cima da nossa —
   * este observador reage a QUALQUER mudança no atributo `style` do botão
   * e desfaz o que não for nosso, continuamente (não só uma vez no
   * carregamento).
   */
  const observadorDeEstilo = new MutationObserver(corrigirSeNecessario);
  observadorDeEstilo.observe(botao, { attributes: true, attributeFilter: ["style", "class"] });

  /**
   * Reforço além do observer (achado real, T-070): mesmo com o observer,
   * testadores continuaram vendo o botão fugir do canto — o widget
   * provavelmente reposiciona em resposta a rolagem/redimensionamento (a
   * tela de leitura da Bíblia rola bastante), e não dá pra confirmar o
   * gatilho exato usado pelo script de terceiro sem acesso ao código dele.
   * Em vez de adivinhar, um loop de `requestAnimationFrame` garante que a
   * nossa correção sempre "ganha por último", a cada quadro, não importa
   * o que disparou a mudança. Para sozinho se o botão sair do documento
   * (evita um loop eterno vazando entre testes/remontagens).
   */
  function loopDeCorrecao(): void {
    if (!document.body.contains(botao)) return;
    corrigirSeNecessario();
    requestAnimationFrame(loopDeCorrecao);
  }
  requestAnimationFrame(loopDeCorrecao);

  function aoPressionar(event: PointerEvent) {
    arrastando = true;
    moveu = false;
    inicioX = event.clientX;
    inicioY = event.clientY;
    botao.setPointerCapture(event.pointerId);
  }

  function aoMover(event: PointerEvent) {
    if (!arrastando) return;
    if (
      !moveu &&
      Math.hypot(event.clientX - inicioX, event.clientY - inicioY) < LIMIAR_ARRASTO_PX
    ) {
      return;
    }
    moveu = true;
    set(botao, "cursor", "grabbing");
    set(botao, "top", `${event.clientY - botao.offsetHeight / 2}px`);
    set(botao, "left", `${event.clientX - botao.offsetWidth / 2}px`);
    set(botao, "bottom", "auto");
    set(botao, "right", "auto");
  }

  function aoSoltar(event: PointerEvent) {
    if (!arrastando) return;
    arrastando = false;
    set(botao, "cursor", "grab");
    if (moveu) {
      cantoAtual = cantoMaisProximo(event.clientX, event.clientY);
      aplicarCanto(botao, cantoAtual);
      salvarCanto(cantoAtual);
    }
  }

  /** Impede que o clique de SOLTAR o arrasto também dispare a abertura do VLibras — só bloqueia quando houve movimento de verdade; um toque parado abre normalmente. */
  function aoClicarCapturado(event: MouseEvent) {
    if (!moveu) return;
    event.preventDefault();
    event.stopPropagation();
    moveu = false;
  }

  botao.addEventListener("pointerdown", aoPressionar);
  botao.addEventListener("pointermove", aoMover);
  botao.addEventListener("pointerup", aoSoltar);
  botao.addEventListener("click", aoClicarCapturado, true);
}

/**
 * O placeholder estático já existe desde o início, mas o `#vlibras-access`
 * real só aparece depois que o widget termina de carregar — este
 * observador NUNCA se desconecta sozinho (T-071: a 1ª versão desligava
 * depois do 1º match, então quando o real substituía o placeholder, o
 * elemento novo ficava pra sempre sem arrasto/correção nenhuma). Compara
 * por REFERÊNCIA (`botaoAtual`) pra nunca inicializar a mesma instância
 * duas vezes — o `MutationObserver` de `childList` no `body` dispara a
 * cada mudança QUALQUER na página (não só no VLibras).
 *
 * Devolve uma função de parada só pra uso em teste (cada `it()` roda numa
 * DOM nova e precisa desligar o observador do teste anterior — em produção
 * a chamada em `main.tsx` é única pra vida inteira da página, então o
 * valor de retorno é ignorado ali de propósito).
 */
export function iniciarVLibrasArrastavel(): () => void {
  let botaoAtual: HTMLElement | null = null;

  function verificarBotao(): void {
    const botao = encontrarBotaoVLibras();
    if (botao && botao !== botaoAtual) {
      botaoAtual = botao;
      tornarArrastavel(botao);
    }
  }

  verificarBotao();
  const observer = new MutationObserver(verificarBotao);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

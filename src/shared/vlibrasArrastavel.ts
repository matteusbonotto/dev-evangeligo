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
 * Causa raiz do "ainda atrapalha" reportado depois do T-065 (que só
 * resolvia o `!important` da posição): o `<div vw-access-button>` já vem
 * PRONTO no HTML estático (`index.html`), então nosso script (module,
 * roda antes de `DOMContentLoaded`) posiciona ele primeiro — mas o script
 * do VLibras só inicializa DEPOIS, no handler de `DOMContentLoaded`, e
 * reaplica a própria posição/estilo por cima da nossa, desfazendo o
 * ancoramento assim que a página carrega (mesmo com `!important`: se o
 * widget escreve via `elemento.style.top = "..."`, isso reseta a
 * prioridade daquela propriedade, não só o valor). Por isso agora
 * observamos mudanças no atributo `style` do próprio botão continuamente
 * e reaplicamos nosso canto sempre que algo além do nosso próprio arrasto
 * mexer nele — não é uma correção de "uma vez só".
 */

const CHAVE_POSICAO = "evangeligo:vlibras:canto";
type Canto = "top-left" | "top-right" | "bottom-left" | "bottom-right";
const CANTOS: Canto[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
const MARGEM_PX = 16;

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
 * O botão já existe no HTML estático (`index.html`) desde o início — mas
 * inicializamos de novo se ele for substituído por completo (o
 * `MutationObserver` de `childList` no `body` cobre esse caso extra,
 * mesmo não sendo o cenário mais comum hoje).
 */
export function iniciarVLibrasArrastavel(): void {
  const existente = document.querySelector<HTMLElement>("[vw-access-button]");
  if (existente) {
    tornarArrastavel(existente);
    return;
  }
  const observer = new MutationObserver(() => {
    const botao = document.querySelector<HTMLElement>("[vw-access-button]");
    if (botao) {
      tornarArrastavel(botao);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

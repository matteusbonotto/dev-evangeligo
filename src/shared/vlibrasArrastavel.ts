/**
 * Torna o botão de acesso do VLibras (widget oficial de Libras, `index.html`,
 * T-017) arrastável e ancorável nos 4 cantos da tela — feedback real de
 * testadores da versão de teste: "o ícone de acessibilidade atrapalha o
 * uso" (fixo sempre no mesmo canto, sobrepondo botões do app). Continua
 * fora da árvore React de propósito (mesmo motivo já documentado em
 * `index.html`: o script do governo gerencia esse DOM sozinho) — este
 * módulo só observa o botão já renderizado pelo VLibras e adiciona
 * arrastar+ancorar por cima, sem reimplementar nem substituir o widget.
 */

const CHAVE_POSICAO = "evangeligo:vlibras:canto";
type Canto = "top-left" | "top-right" | "bottom-left" | "bottom-right";
const CANTOS: Canto[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
const MARGEM_PX = 16;

function aplicarCanto(botao: HTMLElement, canto: Canto): void {
  botao.style.position = "fixed";
  botao.style.top = canto.startsWith("top") ? `${MARGEM_PX}px` : "";
  botao.style.bottom = canto.startsWith("bottom") ? `${MARGEM_PX}px` : "";
  botao.style.left = canto.endsWith("left") ? `${MARGEM_PX}px` : "";
  botao.style.right = canto.endsWith("right") ? `${MARGEM_PX}px` : "";
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

function tornarArrastavel(botao: HTMLElement): void {
  aplicarCanto(botao, carregarCantoSalvo());
  botao.style.cursor = "grab";
  botao.style.touchAction = "none";
  botao.style.zIndex = "2147483647";

  let arrastando = false;
  let moveu = false;
  let inicioX = 0;
  let inicioY = 0;

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
    botao.style.cursor = "grabbing";
    botao.style.top = `${event.clientY - botao.offsetHeight / 2}px`;
    botao.style.left = `${event.clientX - botao.offsetWidth / 2}px`;
    botao.style.bottom = "";
    botao.style.right = "";
  }

  function aoSoltar(event: PointerEvent) {
    if (!arrastando) return;
    arrastando = false;
    botao.style.cursor = "grab";
    if (moveu) {
      const canto = cantoMaisProximo(event.clientX, event.clientY);
      aplicarCanto(botao, canto);
      salvarCanto(canto);
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

/** Observa o DOM até o VLibras injetar seu botão (script de terceiro, assíncrono). */
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

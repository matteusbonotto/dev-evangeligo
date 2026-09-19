import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  BsCheck2,
  BsChevronDown,
  BsChevronRight,
  BsChevronUp,
  BsCircleHalf,
  BsClipboard,
  BsDashLg,
  BsEraserFill,
  BsLockFill,
  BsPaletteFill,
  BsPatchQuestionFill,
  BsPenFill,
  BsPeopleFill,
  BsPlayFill,
  BsPlusLg,
  BsStickyFill,
  BsStopFill,
  BsTextParagraph,
  BsTranslate,
  BsXLg,
} from "react-icons/bs";
import "../bible.css";
import { getLivroByCodigo } from "../data/livros";
import { obterFalante } from "../data/falasEspeciais";
import {
  obterPreferenciaCoresFala,
  salvarPreferenciaCoresFala,
} from "../coresFala";
import {
  obterTraducaoPreferida,
  salvarTraducaoPreferida,
} from "../traducaoPreferida";
import { obterCapituloTraduzido, type CodigoTraducao } from "../traducoes";
import { PainelInfoVersiculo } from "./PainelInfoVersiculo";
import { BalaoTextoOriginal } from "../components/BalaoTextoOriginal";
import { ReferenciaCruzadaModal } from "../components/ReferenciaCruzadaModal";
import {
  formatarReferenciaCruzada,
  obterReferenciasCruzadas,
  type ReferenciaCruzada,
} from "../referenciasCruzadas";
import { buildLeituraPath, buildQuizCapituloPath } from "../routePaths";
import { getQuizCapituloBiblia } from "../quiz/content";
import {
  aplicarMarcaTexto,
  atualizarNota,
  corHerdadaDoTrecho,
  criarNota,
  obterAnotacoesDoCapitulo,
  removerAnotacao,
  removerCorDeAnotacao,
} from "../marcacoes";
import {
  ajustarFonteLeitura,
  obterFonteLeituraSalva,
  salvarFonteLeitura,
} from "../fonteLeitura";
import { expandirParaPalavra } from "../selecaoTexto";
import { useNarracaoBiblia } from "../useNarracaoBiblia";
import {
  calcularEsquerdaDoPin,
  estimarPosicaoPeloPercentual,
  obterProgressoCapitulo,
  registrarProgressoLeitura,
} from "../progresso";
import { CORES_MARCADOR, type Anotacao, type CorMarcador } from "../types";
import { TRADUCOES_BIBLIA } from "../versoes";
import { AppShell } from "../../../shared/components/AppShell";

type CarregamentoStatus = "carregando" | "pronto" | "erro";

interface SelecaoPendente {
  versiculo: number;
  inicio: number;
  fim: number;
  texto: string;
}

interface MenuContextoState {
  pendente: SelecaoPendente;
  /** Anotação existente que sobrepõe o trecho selecionado, se houver (mostra "Remover marcação" e alimenta o post-it). */
  existente: Anotacao | null;
  modoSheet: boolean;
  x: number;
  y: number;
}

interface PostItState {
  id: string | null;
  versiculo: number;
  inicio: number;
  fim: number;
  texto: string;
  conteudo: string;
  corFundo: CorMarcador | undefined;
}

/** Seleção em andamento por toque + pinos (antes de confirmar com "OK"). */
interface SelecaoAtivaState {
  versiculo: number;
  inicio: number;
  fim: number;
}

/** Painel "quem fala"/"significado original" aberto ao tocar no número do versículo (T-041/T-040). */
interface InfoVersiculoState {
  versiculo: number;
  x: number;
  y: number;
}

/** Balão "Ver texto original" aberto a partir do menu de seleção (T-048). */
interface BalaoOriginalState {
  versiculo: number;
  /** Trecho selecionado (T-068) — usados só pra recortar proporcionalmente as palavras originais mostradas, ver `BalaoTextoOriginal`. */
  textoVersiculo: string;
  selecaoInicio: number;
  selecaoFim: number;
  modoSheet: boolean;
  x: number;
  y: number;
}

/** Acha o elemento `[data-verso]` mais próximo (o nó pode ser um nó de texto, sem `.closest`). */
function encontrarVersiculoContainer(node: Node | null): HTMLElement | null {
  if (!node) return null;
  const el =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);
  return el?.closest("[data-verso]") ?? null;
}

/** Soma o tamanho de todo texto antes de `node`/`offsetNoNode`, dentro de `container` — offset de caractere "achatado". */
function offsetDentroDoContainer(
  container: Element,
  node: Node,
  offsetNoNode: number,
): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let total = 0;
  let atual = walker.nextNode();
  while (atual) {
    if (atual === node) return total + offsetNoNode;
    total += atual.textContent?.length ?? 0;
    atual = walker.nextNode();
  }
  return total;
}

/** Inverso de `offsetDentroDoContainer`: acha o nó de texto + offset local para um offset "achatado". */
function localizarNoTexto(
  container: Element,
  offsetAlvo: number,
): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let total = 0;
  let atual = walker.nextNode() as Text | null;
  while (atual) {
    const tamanho = atual.textContent?.length ?? 0;
    if (offsetAlvo <= total + tamanho) {
      return { node: atual, offset: offsetAlvo - total };
    }
    total += tamanho;
    atual = walker.nextNode() as Text | null;
  }
  return null;
}

/** Retângulo (posição na tela) de um offset de caractere — usado para posicionar os pinos de seleção. */
function retanguloNoOffset(
  container: Element,
  offsetAlvo: number,
): DOMRect | null {
  const local = localizarNoTexto(container, offsetAlvo);
  if (!local) return null;
  try {
    const range = document.createRange();
    range.setStart(local.node, local.offset);
    range.setEnd(local.node, local.offset);
    return range.getClientRects()[0] ?? range.getBoundingClientRect();
  } catch {
    return null;
  }
}

/**
 * Offset de caractere sob um ponto da tela (`clientX`/`clientY`) — usa
 * `caretRangeFromPoint` (Chromium/WebKit) ou `caretPositionFromPoint`
 * (Firefox); nenhum dos dois existe no jsdom, por isso retorna `null`
 * em testes (a lógica de arraste em si não é testável fora de um
 * navegador real — ver verificação via Playwright).
 */
function offsetNoPonto(
  container: Element,
  clientX: number,
  clientY: number,
): number | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  let node: Node | null = null;
  let offset = 0;
  if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(clientX, clientY);
    if (!range) return null;
    node = range.startContainer;
    offset = range.startOffset;
  } else if (doc.caretPositionFromPoint) {
    const posicao = doc.caretPositionFromPoint(clientX, clientY);
    if (!posicao) return null;
    node = posicao.offsetNode;
    offset = posicao.offset;
  } else {
    return null;
  }
  if (!node || !container.contains(node)) return null;
  return offsetDentroDoContainer(container, node, offset);
}

function anotacaoSobrepondo(
  anotacoes: Anotacao[],
  versiculo: number,
  inicio: number,
  fim: number,
): Anotacao | null {
  return (
    anotacoes.find(
      (a) => a.versiculo === versiculo && a.fim > inicio && a.inicio < fim,
    ) ?? null
  );
}

/**
 * Leitura de um capítulo (T-011/T-032, RF-09; reescrito para fidelidade
 * ao app legado — usuário: "faz idêntico como o legado"). Porta do
 * legado (`dev-pwa-biblia-game`, `app.js`/`index.html`): A+/A- de fonte,
 * narração por voz, marca-texto de 4 cores com o mesmo menu de contexto
 * (sheet no mobile, popup no desktop), post-it de nota com o mesmo
 * visual (fita, pauta, dobra), dropdown de tradução, e SELEÇÃO POR
 * TOQUE + PINOS ARRASTÁVEIS (`selecaoTexto.ts`) — a seleção nativa do
 * navegador está desativada (`user-select: none`), igual ao legado;
 * tentar selecionar direto com o mouse/dedo não funciona de propósito,
 * é preciso tocar numa palavra e arrastar os pinos de início/fim.
 * Cabeçalho e rodapé de navegação são fixos (posição na tela, não
 * rolam com o texto — achado real do usuário), com versão compacta no
 * mobile. "Alto contraste" e a tradução são explicados em ADR própria:
 * o legado não tem alto contraste como feature (tem tema
 * claro/escuro/sistema, global — fora do escopo desta página), e só
 * migramos 1 das 3 traduções do legado. O "Quiz do capítulo" do rodapé
 * (T-045) libera de verdade só para o livro de Rute por enquanto — prova
 * de conceito de `IA/docs/quiz-biblico-plano.md`; qualquer outro livro
 * ainda mostra "em breve" (cadeado) até ganhar conteúdo próprio.
 * "Cores de fala" (botão na toolbar, ligado
 * por padrão) pinta o versículo inteiro em vermelho quando é fala de
 * Jesus, ou azul quando é fala de Deus Pai — ver `data/falasEspeciais.ts`
 * para a proveniência dos dados e o escopo (Jesus: as 4 evangelhos +
 * Atos/Epístolas/Apocalipse, dataset completo extraído de marcação
 * pública-domínio; Deus: um conjunto curado dos momentos mais
 * reconhecidos, não exaustivo).
 */
export function LeituraPage() {
  const { livroCodigo, capitulo: capituloParam } = useParams<{
    livroCodigo: string;
    capitulo: string;
  }>();
  const livro = livroCodigo ? getLivroByCodigo(livroCodigo) : undefined;
  const capitulo = capituloParam ? Number(capituloParam) : NaN;
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<CarregamentoStatus>("carregando");
  const [versiculos, setVersiculos] = useState<string[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const [fonte, setFonte] = useState<number>(() => obterFonteLeituraSalva());
  const [altoContraste, setAltoContraste] = useState(false);
  const [coresFala, setCoresFala] = useState<boolean>(() =>
    obterPreferenciaCoresFala(),
  );
  const [traducao, setTraducao] = useState<CodigoTraducao>(() =>
    obterTraducaoPreferida(),
  );
  const [versiculoDestacado, setVersiculoDestacado] = useState<number | null>(
    null,
  );
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [menuContexto, setMenuContexto] = useState<MenuContextoState | null>(
    null,
  );
  const [postit, setPostit] = useState<PostItState | null>(null);
  const [infoVersiculo, setInfoVersiculo] = useState<InfoVersiculoState | null>(
    null,
  );
  const [balaoOriginal, setBalaoOriginal] =
    useState<BalaoOriginalState | null>(null);
  const [refsCruzadasPorVerso, setRefsCruzadasPorVerso] = useState<
    Record<number, ReferenciaCruzada[]>
  >({});
  const [refCruzadaAberta, setRefCruzadaAberta] =
    useState<ReferenciaCruzada | null>(null);
  const [selecaoAtiva, setSelecaoAtiva] = useState<SelecaoAtivaState | null>(
    null,
  );
  const [arrastando, setArrastando] = useState<"inicio" | "fim" | null>(null);
  const [pinRects, setPinRects] = useState<{
    inicio: DOMRect;
    fim: DOMRect;
  } | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const cabecalhoRef = useRef<HTMLDivElement>(null);
  const chaveCapituloAnteriorRef = useRef<string | null>(null);

  const narracao = useNarracaoBiblia(livro?.nome ?? "", capitulo, versiculos);

  useEffect(() => {
    if (!livro || !Number.isInteger(capitulo)) return;
    let ativo = true;
    // Troca de TRADUÇÃO (mesmo capítulo) não deve rolar a página nem
    // reiniciar o progresso de leitura — só troca de capítulo faz isso.
    // Ao trocar de capítulo (ex.: botão "Próximo capítulo" no rodapé), o
    // React Router não rola a página pro topo sozinho — a posição de
    // rolagem do capítulo ANTERIOR (perto do fim) ficava valendo no novo
    // capítulo, e o cálculo de progresso por rolagem (efeito abaixo) lia
    // esse scrollTop alto contra a altura do capítulo novo (geralmente
    // menor), registrando ~100% de leitura antes da pessoa ler uma linha
    // sequer — e como o progresso "nunca desce", esse valor errado ficava
    // preso pra sempre naquele capítulo. Rolar pro topo aqui, antes do
    // efeito de progresso rodar, corrige as duas coisas de uma vez: a
    // posição de leitura E o cálculo do progresso partem do zero certo.
    const chaveAtual = `${livro.order}:${capitulo}`;
    const mudouCapitulo = chaveCapituloAnteriorRef.current !== chaveAtual;
    chaveCapituloAnteriorRef.current = chaveAtual;
    if (mudouCapitulo) {
      try {
        window.scrollTo(0, 0);
      } catch {
        // jsdom (ambiente de teste) não implementa scrollTo — inofensivo lá, só barulho no console.
      }
    }
    setStatus("carregando");
    setMenuContexto(null);
    setPostit(null);
    setSelecaoAtiva(null);
    setInfoVersiculo(null);
    setVersiculoDestacado(null);
    obterCapituloTraduzido(livro, capitulo, traducao)
      .then((lista) => {
        if (!ativo) return;
        setVersiculos(lista);
        setAnotacoes(obterAnotacoesDoCapitulo(livro.order, capitulo));
        if (mudouCapitulo) {
          setProgressoAtual(obterProgressoCapitulo(livro.order, capitulo));
        }
        setStatus("pronto");
      })
      .catch(() => {
        if (ativo) setStatus("erro");
      });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livro?.order, capitulo, traducao]);

  /**
   * Referências cruzadas do capítulo (T-050/ADR-042) — buscadas à parte do
   * texto principal (dataset próprio, `referenciasCruzadas.ts`), uma
   * consulta por versículo depois que o texto carrega. A primeira consulta
   * de uma sessão busca o arquivo inteiro (~1.9MB, cacheado depois); as
   * seguintes são só leitura de memória.
   */
  useEffect(() => {
    if (!livro || versiculos.length === 0) return;
    let ativo = true;
    setRefsCruzadasPorVerso({});
    Promise.all(
      versiculos.map((_, index) =>
        obterReferenciasCruzadas(livro.codigo, capitulo, index + 1).then(
          (refs) => [index + 1, refs] as const,
        ),
      ),
    ).then((pares) => {
      if (!ativo) return;
      const mapa: Record<number, ReferenciaCruzada[]> = {};
      for (const [numero, refs] of pares) {
        if (refs.length > 0) mapa[numero] = refs;
      }
      setRefsCruzadasPorVerso(mapa);
    });
    return () => {
      ativo = false;
    };
  }, [livro, capitulo, versiculos]);

  useEffect(() => {
    if (status !== "pronto" || !livro) return;

    function handleScroll() {
      const doc = document.documentElement;
      const totalRolavel = doc.scrollHeight - doc.clientHeight;
      const percentual =
        totalRolavel > 0 ? (doc.scrollTop / totalRolavel) * 100 : 100;
      const salvo = registrarProgressoLeitura(
        livro!.order,
        capitulo,
        percentual,
      );
      setProgressoAtual(salvo);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, livro?.order, capitulo]);

  // Busca por versículo (T-038/ADR-033): `?v=N` na URL (ver
  // `buildLeituraPath`) rola até o versículo e aplica um destaque
  // temporário (anel pulsante, não um preenchimento sólido — não pode ser
  // confundido com marca-texto permanente do usuário). `searchParams` só
  // muda de referência quando a query string da URL muda de verdade
  // (`useSearchParams` internamente faz `useMemo(..., [location.search])`),
  // então este efeito já é "um disparo só" por navegação sem precisar de
  // uma ref de dedupe própria.
  useEffect(() => {
    if (status !== "pronto") return;
    const alvo = Number(searchParams.get("v"));
    if (!Number.isInteger(alvo) || alvo < 1 || alvo > versiculos.length) {
      return;
    }
    const elemento = paperRef.current?.querySelector<HTMLElement>(
      `[data-verso="${alvo}"]`,
    );
    try {
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      // jsdom (ambiente de teste) não implementa scrollIntoView — inofensivo lá.
    }
    setVersiculoDestacado(alvo);
    const timer = setTimeout(() => setVersiculoDestacado(null), 2600);
    return () => clearTimeout(timer);
  }, [status, searchParams, versiculos.length]);

  // Reposiciona os pinos de seleção quando a seleção muda, a fonte muda
  // de tamanho (reflow) ou a janela é redimensionada — a posição vem de
  // `getClientRects()` do DOM real, não de estado próprio.
  useLayoutEffect(() => {
    if (!selecaoAtiva || !paperRef.current) {
      setPinRects(null);
      return;
    }
    function recalcular() {
      if (!selecaoAtiva || !paperRef.current) return;
      const container = paperRef.current.querySelector<HTMLElement>(
        `[data-verso="${selecaoAtiva.versiculo}"] .biblia-versiculo-texto`,
      );
      if (!container) return;
      const rInicio = retanguloNoOffset(container, selecaoAtiva.inicio);
      const rFim = retanguloNoOffset(
        container,
        Math.max(selecaoAtiva.fim - 1, selecaoAtiva.inicio),
      );
      if (rInicio && rFim) setPinRects({ inicio: rInicio, fim: rFim });
    }
    recalcular();
    window.addEventListener("resize", recalcular);
    return () => window.removeEventListener("resize", recalcular);
  }, [selecaoAtiva, fonte]);

  // Mede a altura real do cabeçalho fixo (varia: narração ligada mostra
  // controle de velocidade, mobile é mais compacto que desktop) e
  // publica como `--biblia-cabecalho-height` — `.biblia-page` usa essa
  // variável para reservar espaço equivalente, senão o topo do texto
  // ficaria escondido atrás do cabeçalho fixo.
  useLayoutEffect(() => {
    const el = cabecalhoRef.current;
    if (!el) return;
    function medir() {
      if (!el) return;
      el.style.setProperty(
        "--biblia-cabecalho-height",
        `${el.getBoundingClientRect().height}px`,
      );
      el.closest<HTMLElement>(".biblia-page")?.style.setProperty(
        "--biblia-cabecalho-height",
        `${el.getBoundingClientRect().height}px`,
      );
    }
    medir();
    // `ResizeObserver` não existe no jsdom — a medição inicial já roda.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, narracao.narrando]);

  if (
    !livro ||
    !Number.isInteger(capitulo) ||
    capitulo < 1 ||
    capitulo > livro.totalCapitulos
  ) {
    return <Navigate to="/biblia" replace />;
  }

  function recarregarAnotacoes() {
    if (!livro) return;
    setAnotacoes(obterAnotacoesDoCapitulo(livro.order, capitulo));
  }

  /**
   * Toque numa palavra (não num pino/marcação já existente) — porta
   * `iniciarSelecaoBiblia` do legado: expande para a palavra inteira e
   * mostra os pinos de início/fim, em vez de depender da seleção nativa
   * do navegador (que o usuário reportou como difícil de usar tanto no
   * celular quanto no mouse).
   */
  function handleTapNaLeitura(event: ReactPointerEvent<HTMLDivElement>) {
    if (arrastando) return;
    const alvo = event.target as HTMLElement;
    if (
      alvo.closest(
        ".biblia-pin, .biblia-marca-texto, .biblia-nota-link, .biblia-versiculo-num-btn",
      )
    )
      return;
    const container = encontrarVersiculoContainer(alvo);
    if (!container) {
      setSelecaoAtiva(null);
      return;
    }
    const textoEl = container.querySelector<HTMLElement>(
      ".biblia-versiculo-texto",
    );
    if (!textoEl) return;
    const offset = offsetNoPonto(textoEl, event.clientX, event.clientY);
    if (offset === null) return;
    const numeroVersiculo = Number(container.dataset.verso);
    const texto = versiculos[numeroVersiculo - 1] ?? "";
    const { inicio, fim } = expandirParaPalavra(texto, offset);
    setMenuContexto(null);
    setPostit(null);
    setSelecaoAtiva({ versiculo: numeroVersiculo, inicio, fim });
  }

  function handlePinPointerDown(
    tipo: "inicio" | "fim",
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setArrastando(tipo);
  }

  function handlePinPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!arrastando || !selecaoAtiva || !livro) return;
    const container = paperRef.current?.querySelector<HTMLElement>(
      `[data-verso="${selecaoAtiva.versiculo}"] .biblia-versiculo-texto`,
    );
    if (!container) return;
    const offset = offsetNoPonto(container, event.clientX, event.clientY);
    if (offset === null) return;
    const texto = versiculos[selecaoAtiva.versiculo - 1] ?? "";
    const offsetClampado = Math.max(0, Math.min(offset, texto.length));
    setSelecaoAtiva((atual) => {
      if (!atual) return atual;
      if (arrastando === "inicio") {
        return {
          ...atual,
          inicio: Math.max(0, Math.min(offsetClampado, atual.fim - 1)),
        };
      }
      return {
        ...atual,
        fim: Math.min(texto.length, Math.max(offsetClampado, atual.inicio + 1)),
      };
    });
  }

  function handlePinPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setArrastando(null);
  }

  function cancelarSelecaoAtiva() {
    setSelecaoAtiva(null);
  }

  function selecionarVersiculoInteiroNaSelecaoAtiva() {
    if (!selecaoAtiva) return;
    const texto = versiculos[selecaoAtiva.versiculo - 1] ?? "";
    setSelecaoAtiva((atual) =>
      atual ? { ...atual, inicio: 0, fim: texto.length } : atual,
    );
  }

  function confirmarSelecaoAtiva() {
    if (!selecaoAtiva) return;
    const texto =
      versiculos[selecaoAtiva.versiculo - 1]?.slice(
        selecaoAtiva.inicio,
        selecaoAtiva.fim,
      ) ?? "";
    abrirMenuContexto(
      {
        versiculo: selecaoAtiva.versiculo,
        inicio: selecaoAtiva.inicio,
        fim: selecaoAtiva.fim,
        texto,
      },
      pinRects?.fim.left ?? 0,
      pinRects?.fim.bottom ?? 0,
    );
    setSelecaoAtiva(null);
  }

  function abrirMenuContexto(pendente: SelecaoPendente, x: number, y: number) {
    const existente = anotacaoSobrepondo(
      anotacoes,
      pendente.versiculo,
      pendente.inicio,
      pendente.fim,
    );
    setPostit(null);
    setMenuContexto({
      pendente,
      existente,
      modoSheet: typeof window !== "undefined" && window.innerWidth <= 768,
      x,
      y,
    });
  }

  function fecharMenuContexto() {
    setMenuContexto(null);
  }

  function handleAbrirInfoVersiculo(
    numero: number,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    setMenuContexto(null);
    setPostit(null);
    setSelecaoAtiva(null);
    setInfoVersiculo({
      versiculo: numero,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handleClickAnotacao(event: ReactMouseEvent, anotacao: Anotacao) {
    event.stopPropagation();
    if (anotacao.type === "note") {
      abrirPostit(anotacao);
    } else {
      abrirMenuContexto(
        {
          versiculo: anotacao.versiculo,
          inicio: anotacao.inicio,
          fim: anotacao.fim,
          texto: anotacao.texto,
        },
        event.clientX,
        event.clientY,
      );
    }
  }

  function aplicarCorDoMenu(color: CorMarcador) {
    if (!livro || !menuContexto) return;
    const { versiculo, inicio, fim, texto } = menuContexto.pendente;
    aplicarMarcaTexto(
      livro.order,
      capitulo,
      versiculo,
      inicio,
      fim,
      texto,
      color,
    );
    recarregarAnotacoes();
    fecharMenuContexto();
  }

  function removerMarcacaoDoMenu() {
    if (!livro || !menuContexto?.existente) return;
    const alvo = menuContexto.existente;
    if (alvo.type === "note") {
      removerCorDeAnotacao(livro.order, capitulo, alvo.id);
    } else {
      removerAnotacao(livro.order, capitulo, alvo.id);
    }
    recarregarAnotacoes();
    fecharMenuContexto();
  }

  function abrirNotaDoMenu() {
    if (!livro || !menuContexto) return;
    const { existente, pendente } = menuContexto;
    if (existente && existente.type === "note") {
      abrirPostit(existente);
      return;
    }
    const corFundo =
      existente?.type === "highlight"
        ? existente.color
        : corHerdadaDoTrecho(
            livro.order,
            capitulo,
            pendente.versiculo,
            pendente.inicio,
            pendente.fim,
          );
    setMenuContexto(null);
    setPostit({
      id: null,
      versiculo: pendente.versiculo,
      inicio: pendente.inicio,
      fim: pendente.fim,
      texto: pendente.texto,
      conteudo: "",
      corFundo,
    });
  }

  /** "Ver texto original" a partir do menu de seleção (T-048/ADR-041, recorte proporcional T-068). */
  function abrirBalaoOriginalDoMenu() {
    if (!menuContexto) return;
    const { pendente } = menuContexto;
    setBalaoOriginal({
      versiculo: pendente.versiculo,
      textoVersiculo: versiculos[pendente.versiculo - 1] ?? "",
      selecaoInicio: pendente.inicio,
      selecaoFim: pendente.fim,
      modoSheet: menuContexto.modoSheet,
      x: menuContexto.x,
      y: menuContexto.y,
    });
    setMenuContexto(null);
  }

  /**
   * "Quem fala e contexto" a partir do menu de seleção (Fase 4 do plano de
   * UX, item 8 do feedback original: "biografia do autor etc. também
   * acessível a partir do menu de seleção de texto"). Abre o MESMO painel
   * já aberto ao tocar no número do versículo — não duplica nada.
   */
  function abrirInfoVersiculoDoMenu() {
    if (!menuContexto) return;
    setInfoVersiculo({
      versiculo: menuContexto.pendente.versiculo,
      x: menuContexto.x,
      y: menuContexto.y,
    });
    setMenuContexto(null);
  }

  function abrirPostit(nota: Anotacao) {
    setMenuContexto(null);
    setPostit({
      id: nota.id,
      versiculo: nota.versiculo,
      inicio: nota.inicio,
      fim: nota.fim,
      texto: nota.texto,
      conteudo: nota.noteContent ?? "",
      corFundo: nota.highlightColor,
    });
  }

  function fecharPostit() {
    setPostit(null);
  }

  function salvarPostit() {
    if (!livro || !postit) return;
    if (postit.id) {
      atualizarNota(
        livro.order,
        capitulo,
        postit.id,
        postit.conteudo,
        postit.corFundo,
      );
    } else {
      criarNota(
        livro.order,
        capitulo,
        postit.versiculo,
        postit.inicio,
        postit.fim,
        postit.texto,
        postit.conteudo,
        postit.corFundo,
      );
    }
    recarregarAnotacoes();
    fecharPostit();
  }

  function excluirPostit() {
    if (!livro || !postit?.id) return;
    removerAnotacao(livro.order, capitulo, postit.id);
    recarregarAnotacoes();
    fecharPostit();
  }

  function selecionarVersiculoInteiro() {
    if (!menuContexto) return;
    const { versiculo } = menuContexto.pendente;
    const texto = versiculos[versiculo - 1] ?? "";
    setMenuContexto((atual) =>
      atual
        ? {
            ...atual,
            pendente: { versiculo, inicio: 0, fim: texto.length, texto },
            existente: anotacaoSobrepondo(
              anotacoes,
              versiculo,
              0,
              texto.length,
            ),
          }
        : atual,
    );
  }

  async function copiarTextoDoMenu() {
    if (!menuContexto) return;
    try {
      await navigator.clipboard.writeText(menuContexto.pendente.texto);
    } catch {
      // clipboard indisponível (permissão negada, contexto não seguro) — sem quebrar a UI.
    }
    fecharMenuContexto();
  }

  function handleAumentarFonte() {
    setFonte((atual) => {
      const proxima = ajustarFonteLeitura(atual, 0.15);
      salvarFonteLeitura(proxima);
      return proxima;
    });
  }

  function handleDiminuirFonte() {
    setFonte((atual) => {
      const proxima = ajustarFonteLeitura(atual, -0.15);
      salvarFonteLeitura(proxima);
      return proxima;
    });
  }

  function handleSelecionarTraducao(codigo: CodigoTraducao) {
    setDropdownAberto(false);
    if (codigo === traducao) return;
    setTraducao(codigo);
    salvarTraducaoPreferida(codigo);
  }

  function handleAlternarCoresFala() {
    setCoresFala((atual) => {
      const proximo = !atual;
      salvarPreferenciaCoresFala(proximo);
      return proximo;
    });
  }

  function renderizarVersiculo(numero: number, texto: string): ReactNode[] {
    const doVersiculo = anotacoes
      .filter((a) => a.versiculo === numero)
      .sort((a, b) => a.inicio - b.inicio);

    const partes: ReactNode[] = [];
    let cursor = 0;
    doVersiculo.forEach((a) => {
      if (a.inicio > cursor) partes.push(texto.slice(cursor, a.inicio));
      const trecho = texto.slice(a.inicio, a.fim);

      if (a.type === "highlight") {
        partes.push(
          <mark
            key={a.id}
            className="biblia-marca-texto"
            style={{ background: a.color }}
            role="button"
            tabIndex={0}
            aria-label={`Editar marca-texto: ${trecho}`}
            onClick={(event) => handleClickAnotacao(event, a)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              handleClickAnotacao(event as unknown as ReactMouseEvent, a);
            }}
          >
            {trecho}
          </mark>,
        );
      } else {
        const notaSpan = (
          <span
            key={a.id}
            className="biblia-nota-link"
            role="button"
            tabIndex={0}
            aria-label={`Abrir nota: ${trecho}`}
            onClick={(event) => handleClickAnotacao(event, a)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              handleClickAnotacao(event as unknown as ReactMouseEvent, a);
            }}
          >
            {trecho}
          </span>
        );
        if (a.highlightColor) {
          partes.push(
            <mark
              key={`${a.id}-mark`}
              className="biblia-marca-texto biblia-marca-texto--nota"
              style={{ background: a.highlightColor }}
            >
              {notaSpan}
            </mark>,
          );
        } else {
          partes.push(notaSpan);
        }
      }
      cursor = a.fim;
    });
    if (cursor < texto.length) partes.push(texto.slice(cursor));
    return partes;
  }

  const temAnterior = capitulo > 1;
  const temProximo = capitulo < livro.totalCapitulos;

  return (
    <AppShell>
      <div
        className={`dashboard biblia-page${altoContraste ? " biblia-page--contraste" : ""}`}
      >
        <div className="biblia-leitura-cabecalho" ref={cabecalhoRef}>
          <div className="biblia-leitura-topo">
            <Link
              className="back-link"
              to={`/biblia/${livro.codigo.toLowerCase()}`}
            >
              <FiArrowLeft aria-hidden="true" /> {livro.nome}
            </Link>
            <p
              className="eyebrow biblia-leitura-topo-titulo"
              id="leitura-title"
            >
              {livro.nome} {capitulo}
            </p>

            <div className="btrad-wrap">
              <button
                type="button"
                className="btrad-trigger"
                aria-expanded={dropdownAberto}
                aria-label="Mudar tradução da Bíblia"
                onClick={() => setDropdownAberto((atual) => !atual)}
              >
                <BsTranslate className="btrad-ico" aria-hidden="true" />
                <span className="btrad-label">
                  {TRADUCOES_BIBLIA.find((v) => v.valor === traducao)?.label}
                </span>
                {dropdownAberto ? (
                  <BsChevronUp aria-hidden="true" />
                ) : (
                  <BsChevronDown aria-hidden="true" />
                )}
              </button>

              {dropdownAberto && (
                <div className="btrad-panel" role="menu" aria-label="Tradução">
                  <p className="btrad-panel-titulo">Tradução</p>
                  {TRADUCOES_BIBLIA.map((versao) => (
                    <button
                      key={versao.valor}
                      type="button"
                      className={`btrad-opcao${versao.valor === traducao ? " btrad-opcao--ativa" : ""}`}
                      role="menuitemradio"
                      aria-checked={versao.valor === traducao}
                      onClick={() => handleSelecionarTraducao(versao.valor)}
                    >
                      <span className="btrad-opcao-badge">{versao.label}</span>
                      <span className="btrad-opcao-nome">{versao.nome}</span>
                      {versao.valor === traducao && (
                        <BsCheck2
                          className="btrad-opcao-check"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {status === "pronto" && (
            <>
              {/* Pin com o versículo estimado onde a leitura está (T-070) —
                  mesma ideia do pin de capítulo em `CapitulosPage.tsx`,
                  agora dentro do capítulo: mostra o VERSÍCULO conforme a
                  rolagem avança, não só o capítulo. */}
              <div className="biblia-progresso-com-pin">
                <span
                  className="biblia-progresso-pin"
                  style={{ left: calcularEsquerdaDoPin(progressoAtual) }}
                >
                  v.{estimarPosicaoPeloPercentual(progressoAtual, versiculos.length)}
                </span>
                <div
                  className="biblia-progresso-track biblia-progresso-track--leitura"
                  role="progressbar"
                  aria-label={`Progresso de leitura de ${livro.nome} ${capitulo}`}
                  aria-valuenow={progressoAtual}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="biblia-progresso-fill"
                    style={{ width: `${progressoAtual}%` }}
                  />
                </div>
              </div>

              <div className="bctrl-toolbar">
                <div className="bctrl-group">
                  <button
                    type="button"
                    className={`bctrl-btn${narracao.narrando ? " bctrl-btn--on" : ""}`}
                    disabled={!versiculos.length || !narracao.disponivel}
                    title={
                      narracao.narrando ? "Parar narração" : "Narrar capítulo"
                    }
                    onClick={() =>
                      narracao.narrando ? narracao.parar() : narracao.narrar()
                    }
                  >
                    {narracao.narrando ? (
                      <BsStopFill aria-hidden="true" />
                    ) : (
                      <BsPlayFill aria-hidden="true" />
                    )}
                    <span>{narracao.narrando ? "Parar" : "Narrar"}</span>
                  </button>
                  {narracao.narrando && (
                    <div className="bctrl-speed">
                      <button
                        type="button"
                        className="bctrl-speed-btn"
                        title="Mais lento"
                        onClick={() => narracao.mudarVelocidade(-0.25)}
                      >
                        <BsDashLg aria-hidden="true" />
                      </button>
                      <span className="bctrl-speed-val">
                        {narracao.velocidade}x
                      </span>
                      <button
                        type="button"
                        className="bctrl-speed-btn"
                        title="Mais rápido"
                        onClick={() => narracao.mudarVelocidade(0.25)}
                      >
                        <BsPlusLg aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bctrl-sep" />

                <div className="bctrl-group">
                  <button
                    type="button"
                    className="bctrl-btn bctrl-fonte-sm"
                    title="Diminuir texto"
                    onClick={handleDiminuirFonte}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    className="bctrl-btn bctrl-fonte-lg"
                    title="Aumentar texto"
                    onClick={handleAumentarFonte}
                  >
                    A
                  </button>
                </div>

                <div className="bctrl-sep" />

                <div className="bctrl-group">
                  <button
                    type="button"
                    className={`bctrl-btn${altoContraste ? " bctrl-btn--on" : ""}`}
                    aria-pressed={altoContraste}
                    title={
                      altoContraste
                        ? "Desativar alto contraste"
                        : "Ativar alto contraste"
                    }
                    onClick={() => setAltoContraste((atual) => !atual)}
                  >
                    <BsCircleHalf aria-hidden="true" />
                    <span>Contraste</span>
                  </button>
                  <button
                    type="button"
                    className={`bctrl-btn${coresFala ? " bctrl-btn--on" : ""}`}
                    aria-pressed={coresFala}
                    title={
                      coresFala
                        ? "Desativar cores de fala (Jesus em vermelho, Deus em azul)"
                        : "Ativar cores de fala (Jesus em vermelho, Deus em azul)"
                    }
                    onClick={handleAlternarCoresFala}
                  >
                    <BsPaletteFill aria-hidden="true" />
                    <span>Cores de fala</span>
                  </button>
                </div>
              </div>

              <p className="biblia-dica-selecao">
                Toque em qualquer palavra · arraste os pinos · pressione OK.
                Toque no número do versículo para ver quem fala e o contexto;
                selecione um trecho para ver o texto original.
              </p>
            </>
          )}
        </div>

        {status === "pronto" && (
          <>
            <div
              className="biblia-paper"
              ref={paperRef}
              style={{ fontSize: `${fonte}rem` }}
              onPointerDown={handleTapNaLeitura}
            >
              {versiculos.map((texto, index) => {
                const numero = index + 1;
                const falante = coresFala
                  ? obterFalante(livro.codigo, capitulo, numero)
                  : null;
                const classeFala = falante ? ` biblia-fala-${falante}` : "";
                const classeDestaque =
                  numero === versiculoDestacado
                    ? " biblia-versiculo-destaque"
                    : "";
                const referenciasCruzadas = refsCruzadasPorVerso[numero];
                return (
                  <p
                    key={numero}
                    data-verso={numero}
                    className={`biblia-versiculo-inline${classeDestaque}`}
                  >
                    <sup>
                      <button
                        type="button"
                        className="biblia-versiculo-num biblia-versiculo-num-btn"
                        aria-label={`Informações do versículo ${numero}`}
                        onClick={(event) =>
                          handleAbrirInfoVersiculo(numero, event)
                        }
                      >
                        {numero}
                      </button>
                    </sup>
                    <span className={`biblia-versiculo-texto${classeFala}`}>
                      {renderizarVersiculo(numero, texto)}
                    </span>
                    {referenciasCruzadas && referenciasCruzadas.length > 0 && (
                      <span className="biblia-refs-cruzadas">
                        {" ("}
                        {referenciasCruzadas.map((ref, i) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            <button
                              type="button"
                              className="biblia-ref-cruzada-link"
                              onClick={() => setRefCruzadaAberta(ref)}
                            >
                              {formatarReferenciaCruzada(ref)}
                            </button>
                          </span>
                        ))}
                        {")"}
                      </span>
                    )}
                  </p>
                );
              })}

              {selecaoAtiva && pinRects && (
                <>
                  <div
                    className="biblia-pin biblia-pin--inicio"
                    style={{
                      top:
                        pinRects.inicio.top -
                        (paperRef.current?.getBoundingClientRect().top ?? 0),
                      left:
                        pinRects.inicio.left -
                        (paperRef.current?.getBoundingClientRect().left ?? 0),
                      height: pinRects.inicio.height,
                    }}
                    onPointerDown={(event) =>
                      handlePinPointerDown("inicio", event)
                    }
                    onPointerMove={handlePinPointerMove}
                    onPointerUp={handlePinPointerUp}
                  />
                  <div
                    className="biblia-pin biblia-pin--fim"
                    style={{
                      top:
                        pinRects.fim.top -
                        (paperRef.current?.getBoundingClientRect().top ?? 0),
                      left:
                        pinRects.fim.right -
                        (paperRef.current?.getBoundingClientRect().left ?? 0),
                      height: pinRects.fim.height,
                    }}
                    onPointerDown={(event) =>
                      handlePinPointerDown("fim", event)
                    }
                    onPointerMove={handlePinPointerMove}
                    onPointerUp={handlePinPointerUp}
                  />
                </>
              )}
            </div>

            {selecaoAtiva && (
              <div className="biblia-selecao-barra">
                <button
                  type="button"
                  className="biblia-selecao-btn"
                  onClick={cancelarSelecaoAtiva}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="biblia-selecao-btn"
                  onClick={selecionarVersiculoInteiroNaSelecaoAtiva}
                >
                  Tudo
                </button>
                <button
                  type="button"
                  className="biblia-selecao-btn biblia-selecao-btn--ok"
                  onClick={confirmarSelecaoAtiva}
                >
                  <BsCheck2 aria-hidden="true" /> OK
                </button>
              </div>
            )}
          </>
        )}

        {status === "carregando" && (
          <p className="biblia-status">Carregando texto...</p>
        )}
        {status === "erro" && (
          <p className="biblia-status biblia-status--erro">
            Não foi possível carregar este capítulo. Tente novamente.
          </p>
        )}

        <nav className="biblia-nav" aria-label="Navegação de capítulos">
          {temAnterior ? (
            <Link
              className="secondary-button biblia-nav-lateral"
              to={buildLeituraPath(livro.codigo, capitulo - 1)}
            >
              <FiChevronLeft aria-hidden="true" />{" "}
              <span className="biblia-nav-texto">Capítulo anterior</span>
            </Link>
          ) : (
            <span className="biblia-nav-lateral" />
          )}

          {getQuizCapituloBiblia(livro.order, capitulo) ? (
            <Link
              className="biblia-nav-quiz"
              to={buildQuizCapituloPath(livro.codigo, capitulo)}
              title="Quiz deste capítulo"
            >
              <BsPatchQuestionFill aria-hidden="true" />
              <span className="biblia-nav-texto">Quiz do capítulo</span>
            </Link>
          ) : (
            <button
              type="button"
              className="biblia-nav-quiz"
              disabled
              title="Quiz deste capítulo — em breve (ainda só disponível para o livro de Rute, T-045)"
            >
              <BsPatchQuestionFill aria-hidden="true" />
              <span className="biblia-nav-texto">Quiz do capítulo</span>
              <BsLockFill
                className="biblia-nav-quiz-cadeado"
                aria-hidden="true"
              />
            </button>
          )}

          {temProximo ? (
            <Link
              className="primary-button biblia-nav-lateral"
              to={buildLeituraPath(livro.codigo, capitulo + 1)}
            >
              <span className="biblia-nav-texto">Próximo capítulo</span>{" "}
              <FiChevronRight aria-hidden="true" />
            </Link>
          ) : (
            <span className="biblia-nav-lateral" />
          )}
        </nav>
      </div>

      {menuContexto && (
        <MenuContextoBiblico
          estado={menuContexto}
          onAplicarCor={aplicarCorDoMenu}
          onRemoverMarcacao={removerMarcacaoDoMenu}
          onInserirNota={abrirNotaDoMenu}
          onVerTextoOriginal={abrirBalaoOriginalDoMenu}
          onVerQuemFala={abrirInfoVersiculoDoMenu}
          onCopiarTexto={() => void copiarTextoDoMenu()}
          onSelecionarTudo={selecionarVersiculoInteiro}
          onFechar={fecharMenuContexto}
        />
      )}

      {postit && (
        <PostItModal
          estado={postit}
          onMudarConteudo={(conteudo) =>
            setPostit((atual) => (atual ? { ...atual, conteudo } : atual))
          }
          onMudarCor={(cor) =>
            setPostit((atual) => (atual ? { ...atual, corFundo: cor } : atual))
          }
          onSalvar={salvarPostit}
          onExcluir={postit.id ? excluirPostit : undefined}
          onFechar={fecharPostit}
        />
      )}

      {infoVersiculo && (
        <PainelInfoVersiculo
          livro={livro}
          capitulo={capitulo}
          numero={infoVersiculo.versiculo}
          modoSheet={typeof window !== "undefined" && window.innerWidth <= 768}
          x={infoVersiculo.x}
          y={infoVersiculo.y}
          onFechar={() => setInfoVersiculo(null)}
        />
      )}

      {balaoOriginal && (
        <BalaoTextoOriginal
          livro={livro}
          capitulo={capitulo}
          numero={balaoOriginal.versiculo}
          textoVersiculo={balaoOriginal.textoVersiculo}
          selecaoInicio={balaoOriginal.selecaoInicio}
          selecaoFim={balaoOriginal.selecaoFim}
          modoSheet={balaoOriginal.modoSheet}
          x={balaoOriginal.x}
          y={balaoOriginal.y}
          onFechar={() => setBalaoOriginal(null)}
        />
      )}

      {refCruzadaAberta && (
        <ReferenciaCruzadaModal
          referencia={refCruzadaAberta}
          onFechar={() => setRefCruzadaAberta(null)}
        />
      )}
    </AppShell>
  );
}

function MenuContextoBiblico({
  estado,
  onAplicarCor,
  onRemoverMarcacao,
  onInserirNota,
  onVerTextoOriginal,
  onVerQuemFala,
  onCopiarTexto,
  onSelecionarTudo,
  onFechar,
}: {
  estado: MenuContextoState;
  onAplicarCor: (cor: CorMarcador) => void;
  onRemoverMarcacao: () => void;
  onInserirNota: () => void;
  onVerTextoOriginal: () => void;
  onVerQuemFala: () => void;
  onCopiarTexto: () => void;
  onSelecionarTudo: () => void;
  onFechar: () => void;
}) {
  const mostrarRemover = Boolean(
    estado.existente &&
    (estado.existente.type === "highlight" || estado.existente.highlightColor),
  );
  const preview = estado.pendente.texto.slice(0, 70);
  const reticencias = estado.pendente.texto.length > 70 ? "…" : "";
  const previewCompleto = preview ? `« ${preview}${reticencias} »` : "";

  // Trava a posição do popup dentro da viewport — sem isso, uma seleção
  // perto da borda podia abrir o popup parcialmente fora da tela
  // (achado real ao revisar o próprio código, não só no sheet mobile).
  const LARGURA_POPUP = 260;
  const ALTURA_POPUP_ESTIMADA = 420;
  const MARGEM = 12;
  const posicaoPopup =
    !estado.modoSheet && typeof window !== "undefined"
      ? {
          left: Math.min(
            Math.max(estado.x, MARGEM),
            Math.max(MARGEM, window.innerWidth - LARGURA_POPUP - MARGEM),
          ),
          top: Math.min(
            Math.max(estado.y, MARGEM),
            Math.max(
              MARGEM,
              window.innerHeight - ALTURA_POPUP_ESTIMADA - MARGEM,
            ),
          ),
        }
      : undefined;

  return (
    <div className="bctx-overlay" onClick={onFechar}>
      <div
        className={`bctx-container ${estado.modoSheet ? "bctx-sheet" : "bctx-popup"}`}
        role="dialog"
        aria-label="Marcar trecho selecionado"
        style={posicaoPopup}
        onClick={(event) => event.stopPropagation()}
      >
        {estado.modoSheet && <div className="bctx-handle" />}

        {previewCompleto && <p className="bctx-preview">{previewCompleto}</p>}

        <div className="bctx-section-label">Marcar texto</div>
        <div className="bctx-cores">
          {CORES_MARCADOR.map((cor) => (
            <button
              key={cor.valor}
              type="button"
              className="bctx-cor-btn"
              style={{ "--c": cor.valor } as CSSProperties}
              onClick={() => onAplicarCor(cor.valor)}
            >
              <span className="bctx-cor-preview">
                <BsPenFill className="bctx-cor-pen" aria-hidden="true" />
                <span className="bctx-cor-letra">A</span>
              </span>
              <span className="bctx-cor-nome">{cor.nome}</span>
            </button>
          ))}
        </div>

        <div className="bctx-acoes">
          <button type="button" className="bctx-acao" onClick={onInserirNota}>
            <span className="bctx-acao-ico bctx-ico-nota">
              <BsStickyFill aria-hidden="true" />
            </span>
            <span className="bctx-acao-txt">Inserir nota</span>
            <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="bctx-acao"
            onClick={onVerTextoOriginal}
          >
            <span className="bctx-acao-ico bctx-ico-original">
              <BsTranslate aria-hidden="true" />
            </span>
            <span className="bctx-acao-txt">Ver texto original</span>
            <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
          </button>

          <button type="button" className="bctx-acao" onClick={onVerQuemFala}>
            <span className="bctx-acao-ico bctx-ico-quemfala">
              <BsPeopleFill aria-hidden="true" />
            </span>
            <span className="bctx-acao-txt">Quem fala e contexto</span>
            <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
          </button>

          {mostrarRemover && (
            <button
              type="button"
              className="bctx-acao bctx-acao--perigo"
              onClick={onRemoverMarcacao}
            >
              <span className="bctx-acao-ico bctx-ico-remover">
                <BsEraserFill aria-hidden="true" />
              </span>
              <span className="bctx-acao-txt">Remover marcação</span>
              <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
            </button>
          )}

          <button type="button" className="bctx-acao" onClick={onCopiarTexto}>
            <span className="bctx-acao-ico bctx-ico-copiar">
              <BsClipboard aria-hidden="true" />
            </span>
            <span className="bctx-acao-txt">Copiar texto</span>
            <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="bctx-acao"
            onClick={onSelecionarTudo}
          >
            <span className="bctx-acao-ico bctx-ico-tudo">
              <BsTextParagraph aria-hidden="true" />
            </span>
            <span className="bctx-acao-txt">Selecionar versículo inteiro</span>
            <BsChevronRight className="bctx-acao-seta" aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="bctx-btn-fechar" onClick={onFechar}>
          <BsXLg aria-hidden="true" /> Fechar
        </button>
      </div>
    </div>
  );
}

function PostItModal({
  estado,
  onMudarConteudo,
  onMudarCor,
  onSalvar,
  onExcluir,
  onFechar,
}: {
  estado: PostItState;
  onMudarConteudo: (valor: string) => void;
  onMudarCor: (cor: CorMarcador) => void;
  onSalvar: () => void;
  onExcluir?: () => void;
  onFechar: () => void;
}) {
  const corFundo = estado.corFundo ?? CORES_MARCADOR[0].valor;

  return (
    <div className="modal-nota-overlay" onClick={onFechar}>
      <div
        className="postit"
        style={{ "--postit-bg": corFundo } as CSSProperties}
        role="dialog"
        aria-label="Nota"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="postit-fita" />

        <div className="postit-cabecalho">
          <span className="postit-titulo">
            <BsStickyFill aria-hidden="true" />
            <span>{estado.id ? "Sua nota" : "Nova nota"}</span>
          </span>
          <div
            className="postit-cores"
            role="group"
            aria-label="Cor do post-it"
          >
            {CORES_MARCADOR.map((cor) => (
              <button
                key={cor.valor}
                type="button"
                className={`postit-cor-btn${estado.corFundo === cor.valor ? " postit-cor-btn--ativa" : ""}`}
                style={{ background: cor.valor }}
                title={cor.nome}
                aria-label={cor.nome}
                onClick={() => onMudarCor(cor.valor)}
              />
            ))}
          </div>
        </div>

        {estado.texto && (
          <p className="postit-trecho">
            «<em>{estado.texto}</em>»
          </p>
        )}

        <textarea
          className="postit-textarea"
          rows={5}
          value={estado.conteudo}
          placeholder="Escreva sua nota…"
          onChange={(event) => onMudarConteudo(event.target.value)}
        />

        <div className="postit-footer">
          <button
            type="button"
            className="postit-btn postit-btn--cancelar"
            onClick={onFechar}
          >
            <BsXLg aria-hidden="true" /> Cancelar
          </button>
          {onExcluir && (
            <button
              type="button"
              className="postit-btn postit-btn--excluir"
              onClick={onExcluir}
            >
              {estado.corFundo ? "Remover nota" : "Excluir"}
            </button>
          )}
          <button
            type="button"
            className="postit-btn postit-btn--salvar"
            disabled={!estado.conteudo.trim()}
            onClick={onSalvar}
          >
            {estado.id ? "Salvar" : "Criar nota"}
          </button>
        </div>

        <div className="postit-dobra" />
      </div>
    </div>
  );
}

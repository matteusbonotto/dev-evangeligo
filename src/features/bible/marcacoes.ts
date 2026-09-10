import type { Anotacao, CorMarcador } from "./types";

/**
 * Anotações (marca-texto + notas post-it) por trecho de versículo
 * (T-011/T-032/rework de fidelidade ao legado — RF-09 "leitura,
 * marcações e notas") — migradas de `dev-pwa-biblia-game`
 * (`notacoesCapitulo`/`adicionarMarcador`/`adicionarNota`/
 * `removerMarcadorSelecao` em `app.js`): mesmo modelo de dados unificado
 * (marca-texto e nota são o mesmo tipo de registro), mesma regra de
 * fusão em sobreposição (nunca duas anotações empilhadas no mesmo
 * trecho).
 *
 * Persistidas em `localStorage` (uma lista por capítulo) — não existe
 * `user_progress`/tabela de anotações no Supabase ainda (mesma
 * limitação já registrada para progresso de leitura em
 * `IA/memory/project-memory.md`). Falha silenciosamente se
 * `localStorage` estiver indisponível em vez de quebrar a leitura.
 */

const STORAGE_KEY = "evangeligo:biblia:anotacoes";

function chaveCapitulo(livroOrder: number, capitulo: number): string {
  return `${livroOrder}:${capitulo}`;
}

function lerTudo(): Record<string, Anotacao[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Anotacao[]>) : {};
  } catch {
    return {};
  }
}

function salvarTudo(dados: Record<string, Anotacao[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    // localStorage indisponível — a anotação não persiste, mas a UI segue funcionando.
  }
}

function gerarId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sobrepoe(versiculo: number, inicio: number, fim: number, a: Anotacao): boolean {
  return a.versiculo === versiculo && a.fim > inicio && a.inicio < fim;
}

export function obterAnotacoesDoCapitulo(
  livroOrder: number,
  capitulo: number,
): Anotacao[] {
  const todas = lerTudo();
  return todas[chaveCapitulo(livroOrder, capitulo)] ?? [];
}

/**
 * Aplica marca-texto num trecho — porta `adicionarMarcador` do legado:
 * se o trecho sobrepõe uma NOTA existente, a cor é fundida nela
 * (`highlightColor`), a nota é preservada; se sobrepõe um marca-texto
 * puro, ele é substituído; nunca ficam dois marca-texto empilhados no
 * mesmo trecho.
 */
export function aplicarMarcaTexto(
  livroOrder: number,
  capitulo: number,
  versiculo: number,
  inicio: number,
  fim: number,
  texto: string,
  color: CorMarcador,
): void {
  const k = chaveCapitulo(livroOrder, capitulo);
  const todas = lerTudo();
  const doCapitulo = todas[k] ?? [];

  let notaFundida = false;
  const novas: Anotacao[] = [];
  for (const a of doCapitulo) {
    if (!sobrepoe(versiculo, inicio, fim, a)) {
      novas.push(a);
      continue;
    }
    if (a.type === "note") {
      notaFundida = true;
      novas.push({ ...a, highlightColor: color });
    }
    // marca-texto puro sobreposto: descartado (será substituído abaixo).
  }
  if (!notaFundida) {
    novas.push({ id: gerarId(), type: "highlight", versiculo, inicio, fim, texto, color });
  }
  todas[k] = novas;
  salvarTudo(todas);
}

/**
 * Cria uma nota — porta `adicionarNota` do legado: substitui qualquer
 * anotação sobreposta no mesmo trecho (marca-texto puro ou outra nota).
 * `highlightColor` vem explícito de quem chama (a UI pré-popula a cor
 * inicial do post-it a partir de um marca-texto sobreposto, se houver —
 * ver `corHerdadaDoTrecho` — mas quem decide a cor final salva é sempre
 * o seletor de cor do post-it, igual ao legado).
 */
export function criarNota(
  livroOrder: number,
  capitulo: number,
  versiculo: number,
  inicio: number,
  fim: number,
  texto: string,
  noteContent: string,
  highlightColor?: CorMarcador,
): Anotacao {
  const k = chaveCapitulo(livroOrder, capitulo);
  const todas = lerTudo();
  const doCapitulo = todas[k] ?? [];
  const semSobreposicao = doCapitulo.filter((a) => !sobrepoe(versiculo, inicio, fim, a));

  const nova: Anotacao = {
    id: gerarId(),
    type: "note",
    versiculo,
    inicio,
    fim,
    texto,
    noteContent,
    highlightColor,
  };
  todas[k] = [...semSobreposicao, nova];
  salvarTudo(todas);
  return nova;
}

/** Cor de um marca-texto puro que sobrepõe o trecho, se houver — usada pela UI para pré-popular o post-it. */
export function corHerdadaDoTrecho(
  livroOrder: number,
  capitulo: number,
  versiculo: number,
  inicio: number,
  fim: number,
): CorMarcador | undefined {
  const doCapitulo = obterAnotacoesDoCapitulo(livroOrder, capitulo);
  const existente = doCapitulo.find(
    (a) => a.type === "highlight" && sobrepoe(versiculo, inicio, fim, a),
  );
  return existente?.color;
}

/** Atualiza o conteúdo/cor de uma nota existente (não move o trecho). */
export function atualizarNota(
  livroOrder: number,
  capitulo: number,
  id: string,
  noteContent: string,
  highlightColor: CorMarcador | undefined,
): Anotacao | undefined {
  const k = chaveCapitulo(livroOrder, capitulo);
  const todas = lerTudo();
  const doCapitulo = todas[k] ?? [];
  let atualizada: Anotacao | undefined;
  todas[k] = doCapitulo.map((a) => {
    if (a.id !== id) return a;
    atualizada = { ...a, noteContent, highlightColor };
    return atualizada;
  });
  if (atualizada) salvarTudo(todas);
  return atualizada;
}

/** Remove uma anotação por completo (marca-texto puro, ou nota inteira). */
export function removerAnotacao(livroOrder: number, capitulo: number, id: string): void {
  const k = chaveCapitulo(livroOrder, capitulo);
  const todas = lerTudo();
  const doCapitulo = todas[k] ?? [];
  todas[k] = doCapitulo.filter((a) => a.id !== id);
  salvarTudo(todas);
}

/**
 * Remove só a cor de marca-texto de uma anotação — porta
 * `removerMarcadorSelecao` do legado: numa nota, limpa `highlightColor`
 * preservando a nota+link; num marca-texto puro, remove a anotação
 * inteira (não faz sentido um marca-texto "sem cor").
 */
export function removerCorDeAnotacao(
  livroOrder: number,
  capitulo: number,
  id: string,
): void {
  const k = chaveCapitulo(livroOrder, capitulo);
  const todas = lerTudo();
  const doCapitulo = todas[k] ?? [];
  const alvo = doCapitulo.find((a) => a.id === id);
  if (!alvo) return;

  if (alvo.type === "highlight") {
    todas[k] = doCapitulo.filter((a) => a.id !== id);
  } else {
    todas[k] = doCapitulo.map((a) =>
      a.id === id ? { ...a, highlightColor: undefined } : a,
    );
  }
  salvarTudo(todas);
}

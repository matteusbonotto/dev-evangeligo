/**
 * Progresso de leitura por capítulo (T-011). Pedido explícito do usuário,
 * comparando com o app legado: "barra de progresso que aumenta conforme
 * rola a tela (bloqueia o valor caso tente voltar, só é incremental)".
 * Cada capítulo guarda um percentual 0-100 que só pode SUBIR — rolar de
 * volta para cima nunca reduz o valor salvo (ver `registrarProgressoLeitura`).
 *
 * Persistido em `localStorage`, mesma limitação já registrada para
 * `marcacoes.ts`: não há `aula_progresso`/tabela equivalente no Supabase
 * ainda, então o progresso não sincroniza entre dispositivos.
 */

const STORAGE_KEY = "evangeligo:biblia:progresso-leitura";

/** Percentual mínimo para um capítulo contar como "concluído" (não precisa chegar a 100% exato). */
const LIMIAR_CONCLUIDO = 95;

function lerTodos(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function salvarTodos(progresso: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progresso));
  } catch {
    // localStorage indisponível — progresso não persiste, leitura segue funcionando.
  }
}

function chave(livroOrder: number, capitulo: number): string {
  return `${livroOrder}:${capitulo}`;
}

/**
 * Registra o percentual de leitura de um capítulo. Só atualiza se `percentual`
 * for maior que o valor já salvo (nunca diminui) — retorna o valor final
 * armazenado (o novo, ou o antigo se `percentual` era menor).
 */
export function registrarProgressoLeitura(
  livroOrder: number,
  capitulo: number,
  percentual: number,
): number {
  const limitado = Math.max(0, Math.min(100, Math.round(percentual)));
  const todos = lerTodos();
  const k = chave(livroOrder, capitulo);
  const atual = todos[k] ?? 0;
  if (limitado <= atual) {
    return atual;
  }
  todos[k] = limitado;
  salvarTodos(todos);
  return limitado;
}

export function obterProgressoCapitulo(
  livroOrder: number,
  capitulo: number,
): number {
  return lerTodos()[chave(livroOrder, capitulo)] ?? 0;
}

export function capituloConcluido(
  livroOrder: number,
  capitulo: number,
): boolean {
  return obterProgressoCapitulo(livroOrder, capitulo) >= LIMIAR_CONCLUIDO;
}

/** Percentual médio de leitura do livro inteiro (capítulos não abertos contam como 0%). */
export function obterProgressoLivro(
  livroOrder: number,
  totalCapitulos: number,
): number {
  if (totalCapitulos <= 0) return 0;
  const todos = lerTodos();
  const prefixo = `${livroOrder}:`;
  let soma = 0;
  for (const [k, valor] of Object.entries(todos)) {
    if (k.startsWith(prefixo)) {
      soma += valor;
    }
  }
  return Math.round(soma / totalCapitulos);
}

/** Quantos dos livros informados (por `order`) têm ao menos 1 capítulo com progresso > 0. */
export function contarLivrosIniciados(ordens: readonly number[]): number {
  const todos = lerTodos();
  const livrosComLeitura = new Set<number>();
  for (const [chaveCapitulo, valor] of Object.entries(todos)) {
    if (valor <= 0) continue;
    const livroOrder = Number(chaveCapitulo.split(":")[0]);
    if (ordens.includes(livroOrder)) {
      livrosComLeitura.add(livroOrder);
    }
  }
  return livrosComLeitura.size;
}

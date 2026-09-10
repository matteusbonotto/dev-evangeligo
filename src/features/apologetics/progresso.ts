/**
 * Progresso de estudo da Apologética — quais perguntas o usuário já abriu
 * (porta `apol_progresso`/`marcarPerguntaEstudada` do legado). Persistido em
 * `localStorage`, mesma limitação já registrada em `bible/progresso.ts`: não
 * há tabela equivalente no Supabase ainda, então não sincroniza entre
 * dispositivos.
 */

const STORAGE_KEY = "evangeligo:apologetica:perguntas-estudadas";

function lerEstudadas(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function salvarEstudadas(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponível — progresso não persiste, tela segue funcionando.
  }
}

/** Marca uma pergunta como estudada (idempotente — repetir não duplica). */
export function marcarPerguntaEstudada(perguntaId: string): void {
  const estudadas = lerEstudadas();
  if (!estudadas.includes(perguntaId)) {
    estudadas.push(perguntaId);
    salvarEstudadas(estudadas);
  }
}

export function perguntaEstudada(perguntaId: string): boolean {
  return lerEstudadas().includes(perguntaId);
}

export function obterPerguntasEstudadas(): string[] {
  return lerEstudadas();
}

/** Quantas das perguntas informadas (por id) já foram estudadas. */
export function contarEstudadas(ids: readonly string[]): number {
  const estudadas = new Set(lerEstudadas());
  return ids.filter((id) => estudadas.has(id)).length;
}

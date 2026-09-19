/**
 * Progresso de leitura do Feed de Devocionais — quais devocionais o usuário
 * já abriu. Persistido em `localStorage`, mesmo padrão e mesma limitação já
 * registrada em `apologetics/progresso.ts`/`bible/progresso.ts`: sem tabela
 * equivalente no Supabase ainda, não sincroniza entre dispositivos.
 */

const STORAGE_KEY = "evangeligo:devocionais:lidos";

function lerLidos(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function salvarLidos(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponível — progresso não persiste, tela segue funcionando.
  }
}

/** Marca um devocional como lido (idempotente — repetir não duplica). */
export function marcarDevocionalLido(devocionalId: string): void {
  const lidos = lerLidos();
  if (!lidos.includes(devocionalId)) {
    lidos.push(devocionalId);
    salvarLidos(lidos);
  }
}

export function devocionalLido(devocionalId: string): boolean {
  return lerLidos().includes(devocionalId);
}

export function obterDevocionaisLidos(): string[] {
  return lerLidos();
}

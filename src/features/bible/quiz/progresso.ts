/**
 * Progresso do quiz bíblico por capítulo/livro (T-045). Decisão de produto
 * registrada em `IA/docs/quiz-biblico-plano.md` seção 5 (recomendação
 * preliminar aceita): o quiz é um SELO PARALELO — "compreensão confirmada"
 * — nunca um requisito bloqueando o capítulo como concluído (isso continua
 * sendo só a rolagem de tela, `bible/progresso.ts`). Persistido em
 * `localStorage` por enquanto (mesma limitação já registrada em quase todo
 * progresso deste app antes de existir uma tabela própria — ver
 * IA/docs/quiz-biblico-plano.md seção 6 para o desenho de tabela futuro).
 */

const STORAGE_KEY = "evangeligo:biblia:quiz-aprovados";

function chaveCapitulo(livroCodigo: string, capitulo: number): string {
  return `${livroCodigo}:${capitulo}`;
}

function chaveLivro(livroCodigo: string): string {
  return `${livroCodigo}:livro`;
}

function lerAprovados(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function salvarAprovados(chaves: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chaves));
  } catch {
    // localStorage indisponível — progresso não persiste, tela segue funcionando.
  }
}

function marcarAprovado(chave: string): void {
  const aprovados = lerAprovados();
  if (!aprovados.includes(chave)) {
    aprovados.push(chave);
    salvarAprovados(aprovados);
  }
}

export function marcarQuizCapituloAprovado(livroCodigo: string, capitulo: number): void {
  marcarAprovado(chaveCapitulo(livroCodigo, capitulo));
}

export function quizCapituloAprovado(livroCodigo: string, capitulo: number): boolean {
  return lerAprovados().includes(chaveCapitulo(livroCodigo, capitulo));
}

export function marcarQuizLivroAprovado(livroCodigo: string): void {
  marcarAprovado(chaveLivro(livroCodigo));
}

export function quizLivroAprovado(livroCodigo: string): boolean {
  return lerAprovados().includes(chaveLivro(livroCodigo));
}

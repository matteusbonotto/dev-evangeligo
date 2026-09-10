export type TipoDesafioDiario =
  | "versiculo"
  | "termo"
  | "quebra"
  | "cacaPalavras"
  | "leitura";

interface EstadoDiarioPersistido {
  chave: string;
  concluidos: Partial<Record<TipoDesafioDiario, boolean>>;
}

const CHAVE_LS = "evangeligo:desafios-diarios";

/**
 * Estado de quais destaques do dia já foram concluídos — guardado junto
 * com a CHAVE do dia em que foram concluídos; se o dia salvo for diferente
 * do dia atual, o estado é descartado (reseta sozinho à meia-noite, sem
 * precisar de um job/cron — é só a comparação de chave que muda, ver
 * `desafios.ts#obterChaveDoDia`).
 */
export function carregarEstadoDiario(chaveDoDia: string): EstadoDiarioPersistido {
  try {
    const bruto = localStorage.getItem(CHAVE_LS);
    if (!bruto) return { chave: chaveDoDia, concluidos: {} };
    const salvo = JSON.parse(bruto) as EstadoDiarioPersistido;
    if (salvo.chave !== chaveDoDia) return { chave: chaveDoDia, concluidos: {} };
    return salvo;
  } catch {
    return { chave: chaveDoDia, concluidos: {} };
  }
}

export function marcarDesafioConcluido(
  chaveDoDia: string,
  tipo: TipoDesafioDiario,
): EstadoDiarioPersistido {
  const atual = carregarEstadoDiario(chaveDoDia);
  const atualizado: EstadoDiarioPersistido = {
    chave: chaveDoDia,
    concluidos: { ...atual.concluidos, [tipo]: true },
  };
  try {
    localStorage.setItem(CHAVE_LS, JSON.stringify(atualizado));
  } catch {
    // localStorage indisponível — a sessão continua funcionando em
    // memória, só não sobrevive a um refresh.
  }
  return atualizado;
}

import { supabaseClient } from "../../infrastructure/supabase/client";

/**
 * Exportação e exclusão de dados (LGPD — T-020, contrato em
 * `IA/docs/privacy.md`). Nunca disponível no modo demonstração (não há
 * dado real persistido pra exportar/excluir — ver `ProfilePage.tsx`).
 */

/** Compara o e-mail digitado na confirmação com o e-mail real da conta. */
export function emailConfirmaExclusao(digitado: string, emailReal: string): boolean {
  const normalizar = (valor: string) => valor.trim().toLowerCase();
  return digitado.length > 0 && normalizar(digitado) === normalizar(emailReal);
}

export async function exportarMeusDados(): Promise<Record<string, unknown>> {
  if (!supabaseClient) {
    throw new Error("Supabase não configurado.");
  }
  const { data, error } = await supabaseClient.rpc("exportar_meus_dados");
  if (error) {
    throw new Error(error.message);
  }
  return data as Record<string, unknown>;
}

/** Dispara o download de um objeto como arquivo `.json` no navegador. */
export function baixarComoJson(dados: unknown, nomeArquivo: string): void {
  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function excluirMinhaConta(): Promise<void> {
  if (!supabaseClient) {
    throw new Error("Supabase não configurado.");
  }
  const { data, error } = await supabaseClient.functions.invoke<{
    ok: boolean;
    error?: string;
  }>("delete-account");
  if (error) {
    throw new Error(error.message);
  }
  if (!data?.ok) {
    throw new Error(data?.error ?? "Falha ao excluir a conta.");
  }
}

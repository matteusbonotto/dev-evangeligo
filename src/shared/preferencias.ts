/**
 * Preferências gerais do app, persistidas em `localStorage` (T-073) —
 * pedido explícito do usuário depois de várias rodadas tentando (sem
 * sucesso confirmado no aparelho dele) corrigir a posição do VLibras:
 * "desisto, bota em perfil 2 switches, 1 pra permitir notificações push e
 * outro pra permitir o VLibras... se false, desativa o JavaScript dessa
 * biblioteca". Em vez de continuar brigando com o widget de terceiro, dá
 * controle direto pro usuário desligar o script inteiro.
 */

const CHAVE_VLIBRAS = "evangeligo:pref:vlibrasHabilitado";
const CHAVE_NOTIFICACOES = "evangeligo:pref:notificacoesHabilitadas";

function lerBooleano(chave: string, padrao: boolean): boolean {
  try {
    const valor = localStorage.getItem(chave);
    if (valor === null) return padrao;
    return valor === "true";
  } catch {
    return padrao;
  }
}

function salvarBooleano(chave: string, valor: boolean): void {
  try {
    localStorage.setItem(chave, String(valor));
  } catch {
    // localStorage indisponível — a preferência só não persiste entre sessões.
  }
}

/** VLibras vem HABILITADO por padrão (comportamento de sempre) — o usuário desliga explicitamente se quiser. */
export function obterPreferenciaVLibras(): boolean {
  return lerBooleano(CHAVE_VLIBRAS, true);
}

export function definirPreferenciaVLibras(habilitado: boolean): void {
  salvarBooleano(CHAVE_VLIBRAS, habilitado);
}

/** Notificações vêm DESLIGADAS por padrão — precisam de permissão explícita do navegador pra valer alguma coisa. */
export function obterPreferenciaNotificacoes(): boolean {
  return lerBooleano(CHAVE_NOTIFICACOES, false);
}

export function definirPreferenciaNotificacoes(habilitado: boolean): void {
  salvarBooleano(CHAVE_NOTIFICACOES, habilitado);
}

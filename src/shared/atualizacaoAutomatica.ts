/**
 * Força qualquer novo deploy a substituir a versão em cache assim que
 * detectado, em vez de deixar o service worker esperar todas as abas
 * fecharem (comportamento padrão do Workbox). Sem isto, `registerType:
 * "autoUpdate"` sozinho só troca o worker em segundo plano — a aba já
 * aberta continua rodando o JS antigo até um reload manual, que é
 * exatamente o "não carrega a atualização" relatado por usuários reais.
 *
 * Como é uma SPA, a maior parte da navegação é client-side (sem reload de
 * página), então o navegador raramente dispara sozinho a checagem nativa
 * de atualização do service worker — por isso o `setInterval` chamando
 * `registration.update()` explicitamente.
 */

import { registerSW } from "virtual:pwa-register";

const INTERVALO_VERIFICACAO_MS = 30 * 60 * 1000;

export function iniciarAtualizacaoAutomatica(): void {
  const atualizarSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void atualizarSW(true);
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update().catch(() => {
          // Falha de rede numa checagem de atualização não é um erro pro
          // usuário — só tenta de novo no próximo intervalo.
        });
      }, INTERVALO_VERIFICACAO_MS);
    },
  });
}

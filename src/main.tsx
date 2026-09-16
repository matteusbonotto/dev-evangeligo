import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./features/authentication/context/AuthContext";
import { iniciarAtualizacaoAutomatica } from "./shared/atualizacaoAutomatica";
import { iniciarVLibrasArrastavel } from "./shared/vlibrasArrastavel";
import "./styles/global.css";

/**
 * Cada uma isolada no seu próprio try/catch (T-072) — sem isso, uma
 * exceção síncrona numa (ex.: `registerSW` falhando num navegador sem
 * suporte completo a service worker) impediria a OUTRA de sequer rodar,
 * já que são 2 statements seguidos no mesmo módulo. Nenhuma das duas é
 * essencial pro app funcionar (só melhoram atualização/acessibilidade),
 * então uma falha aqui nunca deve virar tela em branco.
 */
try {
  iniciarAtualizacaoAutomatica();
} catch (erro) {
  console.error("Falha ao iniciar atualização automática do PWA:", erro);
}
try {
  iniciarVLibrasArrastavel();
} catch (erro) {
  console.error("Falha ao iniciar o arrasto do VLibras:", erro);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);

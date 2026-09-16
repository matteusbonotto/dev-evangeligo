import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./features/authentication/context/AuthContext";
import { iniciarAtualizacaoAutomatica } from "./shared/atualizacaoAutomatica";
import { iniciarVLibrasArrastavel } from "./shared/vlibrasArrastavel";
import "./styles/global.css";

iniciarAtualizacaoAutomatica();
iniciarVLibrasArrastavel();

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

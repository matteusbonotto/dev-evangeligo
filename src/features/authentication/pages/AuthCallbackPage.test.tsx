import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { AuthCallbackPage } from "./AuthCallbackPage";

function renderCallbackPage() {
  return render(
    <MemoryRouter initialEntries={["/auth/retorno"]}>
      <AuthProvider>
        <Routes>
          <Route path="/auth/retorno" element={<AuthCallbackPage />} />
          <Route path="/entrar" element={<p>Tela de entrada</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthCallbackPage", () => {
  it("sem sessão (Supabase não configurado no teste), redireciona para a tela de entrada", async () => {
    renderCallbackPage();
    expect(await screen.findByText("Tela de entrada")).toBeInTheDocument();
  });
});

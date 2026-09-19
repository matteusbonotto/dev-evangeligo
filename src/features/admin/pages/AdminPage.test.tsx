import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../authentication/context/AuthContext";
import { AdminPage } from "./AdminPage";

/** Entra em modo demonstração assim que monta (mesmo padrão de ProfilePage.test.tsx). */
function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <AdminPage />;
}

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AuthProvider>
        <Routes>
          <Route path="/jornada" element={<div>Painel do jogador</div>} />
          <Route path="/admin" element={<ComDemoAtivo />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AdminPage", () => {
  /**
   * T-015 — a conta demonstração nunca tem `role: "admin"` (ver
   * `demoUser.ts`), então precisa ser barrada e redirecionada, nunca ver
   * o CRUD real (que faria chamadas reais ao Supabase).
   */
  it("redireciona pro painel do jogador quando o usuário não é admin (modo demonstração)", async () => {
    renderAdmin();
    expect(await screen.findByText("Painel do jogador")).toBeInTheDocument();
    expect(screen.queryByText("Painel admin")).not.toBeInTheDocument();
  });
});

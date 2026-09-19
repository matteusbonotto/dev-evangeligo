import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../authentication/context/AuthContext";
import { ChatPage } from "./ChatPage";

function ComDemoAtivo() {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (!user) return null;
  return <ChatPage />;
}

function renderChat() {
  return render(
    <MemoryRouter initialEntries={["/comunidade/amigo-123"]}>
      <AuthProvider>
        <Routes>
          <Route path="/comunidade/:amigoId" element={<ComDemoAtivo />} />
          <Route path="/comunidade" element={<p>Lista de amigos</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ChatPage", () => {
  /** T-014 — modo demonstração não tem amigos/mensagens reais. */
  it("redireciona pra /comunidade no modo demonstração", async () => {
    renderChat();
    expect(await screen.findByText("Lista de amigos")).toBeInTheDocument();
  });
});

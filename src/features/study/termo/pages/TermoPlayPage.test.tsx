import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../../../authentication/context/AuthContext";
import { getTermoChallengeById } from "../content";
import { TermoPlayPage } from "./TermoPlayPage";

const challenge = getTermoChallengeById("termo-graca")!; // resposta normalizada: "GRACA"

/** Cada teste começa um "dia" novo — sem isso, a recompensa cheia de um
 * teste anterior deixaria o próximo teste com a recompensa reduzida
 * (T-063: limite de recompensa cheia é 1x/dia por tipo de jogo). */
beforeEach(() => {
  localStorage.clear();
});

/** Entra em modo demonstração assim que monta — sem `user`, a recompensa não é creditada (mesmo gate de `!user` já existia antes do T-063, só a exibição do texto não checava isso). */
function ComDemoAtivo({ children }: { children: React.ReactNode }) {
  const { signInDemo, user } = useAuth();
  useEffect(() => {
    if (!user) signInDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  return <>{children}</>;
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ComDemoAtivo>
          <Routes>
            <Route path="/exercicios/termo/:id" element={<TermoPlayPage />} />
            <Route path="/exercicios/termo" element={<p>Lista de termos</p>} />
          </Routes>
        </ComDemoAtivo>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function digitar(palavra: string) {
  for (const letra of palavra) {
    fireEvent.click(screen.getByRole("button", { name: letra }));
  }
}

describe("TermoPlayPage", () => {
  it("redireciona para a lista quando o desafio não existe", () => {
    renderPage("/exercicios/termo/inexistente");
    expect(screen.getByText("Lista de termos")).toBeInTheDocument();
  });

  it("exibe a referência e uma grade de 6 tentativas x tamanho da resposta", () => {
    renderPage(`/exercicios/termo/${challenge.id}`);
    expect(screen.getByText(challenge.referencia)).toBeInTheDocument();
    expect(document.querySelectorAll(".termo-celula")).toHaveLength(30);
  });

  it("clicar Enviar sem preencher a tentativa mostra um erro, sem avançar linha", () => {
    renderPage(`/exercicios/termo/${challenge.id}`);
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(
      screen.getByText("Complete as 5 letras antes de confirmar."),
    ).toBeInTheDocument();
  });

  it("acertar a palavra mostra a tela de vitória com a recompensa", () => {
    renderPage(`/exercicios/termo/${challenge.id}`);
    digitar("GRACA");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(screen.getByText("Você acertou!")).toBeInTheDocument();
    expect(screen.getByText("+50 XP · +25 ouro")).toBeInTheDocument();
  });

  it("uma tentativa errada colore as células e o teclado, sem terminar o jogo", () => {
    renderPage(`/exercicios/termo/${challenge.id}`);
    // "SELOS" não compartilha nenhuma letra com "GRACA".
    digitar("SELOS");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(document.querySelectorAll(".termo-celula--ausente")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "S" })).toHaveClass(
      "termo-tecla--ausente",
    );
    expect(screen.queryByText("Você acertou!")).not.toBeInTheDocument();
    expect(screen.queryByText("Não foi dessa vez")).not.toBeInTheDocument();
  });

  it("esgotar as tentativas sem acertar mostra a tela de derrota, sem recompensa", () => {
    renderPage(`/exercicios/termo/${challenge.id}`);
    for (let i = 0; i < 6; i++) {
      digitar("SELOS");
      fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    }

    expect(screen.getByText("Não foi dessa vez")).toBeInTheDocument();
    expect(screen.getByText("GRACA")).toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
  });
});

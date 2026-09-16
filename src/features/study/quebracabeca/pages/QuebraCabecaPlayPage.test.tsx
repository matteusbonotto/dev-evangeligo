import { fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../../authentication/context/AuthContext";
import { _resetCacheParaTeste } from "../../../bible/dataLoader";
import { QuebraCabecaPlayPage } from "./QuebraCabecaPlayPage";
import type { BibliaData } from "../../../bible/types";

// challenge "qc-filipenses-4-13" aponta para livroOrder 50, capítulo 4, versículo 13.
const VERSICULO_TESTE = "Posso tudo naquele que me fortalece";
const bibliaFake: BibliaData = {
  translation: "Teste",
  abbreviation: "teste",
  language: "Portuguese",
  source: "https://exemplo.test",
  sourceVersion: "0.0.0",
  sourceLicense: "GPL",
  generatedAt: "2026-01-01T00:00:00.000Z",
  books: {
    "50": [[], [], [], [...Array(12).fill("x"), VERSICULO_TESTE]],
  },
};

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
            <Route
              path="/exercicios/quebra-cabeca/:id"
              element={<QuebraCabecaPlayPage />}
            />
            <Route
              path="/exercicios/quebra-cabeca"
              element={<p>Lista de quebra-cabeças</p>}
            />
          </Routes>
        </ComDemoAtivo>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  _resetCacheParaTeste();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(bibliaFake) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function montarNaOrdemCorreta() {
  const banco = screen.getByRole("group", { name: "Banco de palavras" });
  for (const palavra of VERSICULO_TESTE.split(" ")) {
    fireEvent.click(within(banco).getByRole("button", { name: palavra }));
  }
}

describe("QuebraCabecaPlayPage", () => {
  it("redireciona para a lista quando o desafio não existe", () => {
    renderPage("/exercicios/quebra-cabeca/inexistente");
    expect(screen.getByText("Lista de quebra-cabeças")).toBeInTheDocument();
  });

  it("carrega o versículo e mostra uma ficha do banco para cada palavra", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    expect(await screen.findByText("Filipenses 4:13")).toBeInTheDocument();

    const banco = screen.getByRole("group", { name: "Banco de palavras" });
    expect(within(banco).getAllByRole("button")).toHaveLength(
      VERSICULO_TESTE.split(" ").length,
    );
  });

  it("Verificar fica desabilitado até todas as palavras serem posicionadas", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await screen.findByText("Filipenses 4:13");

    expect(screen.getByRole("button", { name: "Verificar" })).toBeDisabled();

    const banco = screen.getByRole("group", { name: "Banco de palavras" });
    fireEvent.click(within(banco).getAllByRole("button")[0]);
    expect(screen.getByRole("button", { name: "Verificar" })).toBeDisabled();
  });

  it("montar na ordem certa e verificar mostra a tela de vitória com a recompensa", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await screen.findByText("Filipenses 4:13");

    montarNaOrdemCorreta();
    fireEvent.click(screen.getByRole("button", { name: "Verificar" }));

    expect(screen.getByText("Você acertou!")).toBeInTheDocument();
    expect(screen.getByText(VERSICULO_TESTE)).toBeInTheDocument();
    expect(screen.getByText("+50 XP · +25 ouro")).toBeInTheDocument();
  });

  it("montar fora de ordem e verificar mostra aviso, sem terminar o jogo", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await screen.findByText("Filipenses 4:13");

    const banco = screen.getByRole("group", { name: "Banco de palavras" });
    // Ordem propositalmente errada: última palavra primeiro.
    const palavrasInvertidas = [...VERSICULO_TESTE.split(" ")].reverse();
    for (const palavra of palavrasInvertidas) {
      fireEvent.click(within(banco).getByRole("button", { name: palavra }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Verificar" }));

    expect(
      screen.getByText("Ainda não está certo. Continue ajustando."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Você acertou!")).not.toBeInTheDocument();
  });

  it("tocar numa palavra já montada a devolve ao banco", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await screen.findByText("Filipenses 4:13");

    const banco = screen.getByRole("group", { name: "Banco de palavras" });
    fireEvent.click(within(banco).getByRole("button", { name: "Posso" }));

    const montada = screen.getByRole("group", { name: "Frase montada" });
    expect(within(montada).getByRole("button", { name: "Posso" })).toBeInTheDocument();

    fireEvent.click(within(montada).getByRole("button", { name: "Posso" }));
    expect(
      within(screen.getByRole("group", { name: "Banco de palavras" })).getByRole(
        "button",
        { name: "Posso" },
      ),
    ).toBeInTheDocument();
  });

  it("Recomeçar embaralha de novo com todas as palavras de volta ao banco", async () => {
    renderPage("/exercicios/quebra-cabeca/qc-filipenses-4-13");
    await screen.findByText("Filipenses 4:13");

    montarNaOrdemCorreta();
    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));

    const banco = screen.getByRole("group", { name: "Banco de palavras" });
    expect(within(banco).getAllByRole("button")).toHaveLength(
      VERSICULO_TESTE.split(" ").length,
    );
    const montada = screen.getByRole("group", { name: "Frase montada" });
    expect(within(montada).queryAllByRole("button")).toHaveLength(0);
  });
});

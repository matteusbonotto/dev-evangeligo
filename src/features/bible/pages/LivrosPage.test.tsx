import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { _resetCacheParaTeste } from "../dataLoader";
import { LivrosPage } from "./LivrosPage";
import type { BibliaData } from "../types";

const bibliaFake: BibliaData = {
  translation: "Teste",
  abbreviation: "teste",
  language: "Portuguese",
  source: "https://exemplo.test",
  sourceVersion: "0.0.0",
  sourceLicense: "GPL",
  generatedAt: "2026-01-01T00:00:00.000Z",
  books: {
    "43": [["v1", "v2", "v3"]],
  },
};

beforeEach(() => {
  localStorage.clear();
  _resetCacheParaTeste();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(bibliaFake) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderLivrosPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LivrosPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LivrosPage", () => {
  it("exibe os 66 livros com filtros por testamento", () => {
    renderLivrosPage();
    expect(
      screen.getByRole("button", { name: "Antigo Testamento" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Novo Testamento" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gênesis/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Apocalipse/ }),
    ).toBeInTheDocument();
  });

  it("cada link de livro aponta para a rota de capítulos correspondente", () => {
    renderLivrosPage();
    expect(screen.getByRole("link", { name: /Gênesis/ })).toHaveAttribute(
      "href",
      "/biblia/gen",
    );
  });

  it("exibe o resumo geral de progresso (0/66 livros sem leitura)", () => {
    renderLivrosPage();
    expect(screen.getByText("0/66 livros")).toBeInTheDocument();
  });

  it("mostra o cartão da Harpa Cristã depois de Apocalipse, apontando para /harpa", () => {
    renderLivrosPage();
    expect(screen.getByRole("link", { name: /Harpa Cristã/ })).toHaveAttribute(
      "href",
      "/harpa",
    );
  });

  it("o filtro 'Harpa Cristã' isola só o cartão da Harpa (nenhum livro)", () => {
    renderLivrosPage();
    fireEvent.click(screen.getByRole("button", { name: "Harpa Cristã" }));
    expect(
      screen.getByRole("link", { name: /Harpa Cristã/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Gênesis/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Apocalipse/ }),
    ).not.toBeInTheDocument();
  });

  it("não mostra mais o nome da tradução nem o aviso de licença no topo (T-052)", () => {
    renderLivrosPage();
    expect(screen.queryByText(/Almeida/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/domínio público sob revisão de licença/),
    ).not.toBeInTheDocument();
  });

  it("cada cartão tem um badge com a sigla do testamento e um ícone de categoria", () => {
    renderLivrosPage();
    const genesis = screen.getByRole("link", { name: /Gênesis/ });
    expect(genesis).toHaveTextContent("Gn");
    expect(
      genesis.querySelector('[aria-label="Lei (Torá)"]'),
    ).toBeInTheDocument();

    const mateus = screen.getByRole("link", { name: /Mateus/ });
    expect(mateus).toHaveTextContent("Mt");
    expect(
      mateus.querySelector('[aria-label="Evangelho"]'),
    ).toBeInTheDocument();
  });

  describe("filtro por nome do livro", () => {
    it("digitar um nome estreita a grade só pros livros que combinam", () => {
      renderLivrosPage();
      fireEvent.change(screen.getByPlaceholderText("Filtrar livros pelo nome…"), {
        target: { value: "gene" },
      });
      expect(screen.getByRole("link", { name: /Gênesis/ })).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Êxodo/ }),
      ).not.toBeInTheDocument();
    });

    it("ignora acentuação (buscar 'genesis' acha 'Gênesis')", () => {
      renderLivrosPage();
      fireEvent.change(screen.getByPlaceholderText("Filtrar livros pelo nome…"), {
        target: { value: "genesis" },
      });
      expect(screen.getByRole("link", { name: /Gênesis/ })).toBeInTheDocument();
    });

    it("mostra uma mensagem quando nenhum livro combina com a busca", () => {
      renderLivrosPage();
      fireEvent.change(screen.getByPlaceholderText("Filtrar livros pelo nome…"), {
        target: { value: "zzz-nao-existe" },
      });
      expect(
        screen.getByText(/Nenhum livro encontrado/),
      ).toBeInTheDocument();
    });
  });

  describe("busca por versículo", () => {
    it("o link 'Ir' só aparece depois de escolher livro, capítulo e versículo", async () => {
      renderLivrosPage();
      expect(
        screen.queryByRole("link", { name: /Ir/ }),
      ).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Livro"), {
        target: { value: "JHN" },
      });
      expect(
        screen.queryByRole("link", { name: /Ir/ }),
      ).not.toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Capítulo"), {
        target: { value: "1" },
      });
      // Enquanto a contagem de versículos carrega (arquivo local), o campo
      // começa como um número livre — depois vira um select com 1..N.
      expect(screen.getByLabelText("Versículo")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Ir/ }),
      ).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByLabelText("Versículo").tagName).toBe("SELECT");
      });

      fireEvent.change(screen.getByLabelText("Versículo"), {
        target: { value: "2" },
      });
      expect(screen.getByRole("link", { name: /Ir/ })).toHaveAttribute(
        "href",
        "/biblia/jhn/1?v=2",
      );
    });

    it("o cabeçalho do accordion (mobile) resume a seleção e alterna aria-expanded", () => {
      renderLivrosPage();
      const cabecalho = screen.getByRole("button", {
        name: "Buscar versículo",
      });
      expect(cabecalho).toHaveAttribute("aria-expanded", "false");

      fireEvent.change(screen.getByLabelText("Livro"), {
        target: { value: "JHN" },
      });
      expect(
        screen.getByRole("button", { name: /João/ }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /João/ }));
      expect(
        screen.getByRole("button", { name: /João/ }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("trocar o livro reinicia capítulo e versículo escolhidos", async () => {
      renderLivrosPage();
      fireEvent.change(screen.getByLabelText("Livro"), {
        target: { value: "JHN" },
      });
      fireEvent.change(screen.getByLabelText("Capítulo"), {
        target: { value: "1" },
      });
      await waitFor(() => {
        expect(screen.getByLabelText("Versículo").tagName).toBe("SELECT");
      });
      fireEvent.change(screen.getByLabelText("Versículo"), {
        target: { value: "2" },
      });

      fireEvent.change(screen.getByLabelText("Livro"), {
        target: { value: "GEN" },
      });
      expect(screen.getByLabelText("Capítulo")).toHaveValue("");
      expect(
        screen.queryByRole("link", { name: /Ir/ }),
      ).not.toBeInTheDocument();
    });
  });
});

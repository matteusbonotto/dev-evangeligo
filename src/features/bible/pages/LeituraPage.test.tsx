import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { _resetCacheParaTeste } from "../dataLoader";
import { obterAnotacoesDoCapitulo } from "../marcacoes";
import { LeituraPage } from "./LeituraPage";
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
    "43": [["No princípio era o Verbo.", "O Verbo estava com Deus."]],
  },
};

function renderLeituraPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/biblia/:livroCodigo/:capitulo" element={<LeituraPage />} />
          <Route path="/biblia/:livroCodigo" element={<p>Lista de capítulos</p>} />
          <Route path="/biblia" element={<p>Lista de livros</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

/**
 * Simula tocar numa palavra e confirmar com "OK" — o fluxo real de
 * seleção por pinos (não a seleção nativa do navegador, que a página
 * não usa mais). `document.caretRangeFromPoint` não existe no jsdom,
 * então é mockado para devolver um Range no offset desejado
 * (as coordenadas de pixel em si não importam para o teste).
 */
function selecionarPalavraNoVersiculo(numeroVersiculo: number, offsetNaPalavra: number) {
  const container = document.querySelector(`[data-verso="${numeroVersiculo}"]`)!;
  const textoEl = container.querySelector(".biblia-versiculo-texto")!;
  const textNode = textoEl.childNodes[0];
  (document as unknown as { caretRangeFromPoint: () => Range }).caretRangeFromPoint = () => {
    const range = document.createRange();
    range.setStart(textNode, offsetNaPalavra);
    range.setEnd(textNode, offsetNaPalavra);
    return range;
  };
  fireEvent.pointerDown(container, { clientX: 0, clientY: 0 });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
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

describe("LeituraPage", () => {
  it("carrega e exibe os versículos do capítulo em texto corrido", async () => {
    renderLeituraPage("/biblia/jhn/1");
    expect(await screen.findByText(/No princípio era o Verbo\./)).toBeInTheDocument();
    expect(screen.getByText(/O Verbo estava com Deus\./)).toBeInTheDocument();
  });

  it("selecionar um trecho abre o menu de contexto com o preview e as 4 cores", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);

    selecionarPalavraNoVersiculo(1, 0); // "No"

    const menu = screen.getByRole("dialog", { name: "Marcar trecho selecionado" });
    expect(within(menu).getByText("« No »")).toBeInTheDocument();
    expect(within(menu).getByText("Amarelo")).toBeInTheDocument();
    expect(within(menu).getByText("Laranja")).toBeInTheDocument();
    expect(within(menu).getByText("Verde")).toBeInTheDocument();
    expect(within(menu).getByText("Azul")).toBeInTheDocument();
    expect(within(menu).getByText("Inserir nota")).toBeInTheDocument();
    expect(within(menu).getByText("Copiar texto")).toBeInTheDocument();
    expect(within(menu).queryByText("Remover marcação")).not.toBeInTheDocument();
  });

  it("tocar numa palavra mostra a barra Cancelar/Tudo/OK antes de abrir o menu", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    const container = document.querySelector('[data-verso="1"]')!;
    const textoEl = container.querySelector(".biblia-versiculo-texto")!;
    const textNode = textoEl.childNodes[0];
    (document as unknown as { caretRangeFromPoint: () => Range }).caretRangeFromPoint = () => {
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 0);
      return range;
    };

    fireEvent.pointerDown(container, { clientX: 0, clientY: 0 });

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tudo" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Cancelar limpa a seleção ativa sem abrir o menu", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    const container = document.querySelector('[data-verso="1"]')!;
    const textoEl = container.querySelector(".biblia-versiculo-texto")!;
    const textNode = textoEl.childNodes[0];
    (document as unknown as { caretRangeFromPoint: () => Range }).caretRangeFromPoint = () => {
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 0);
      return range;
    };
    fireEvent.pointerDown(container, { clientX: 0, clientY: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("button", { name: "OK" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Tudo expande a seleção para o versículo inteiro antes de confirmar", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    const container = document.querySelector('[data-verso="1"]')!;
    const textoEl = container.querySelector(".biblia-versiculo-texto")!;
    const textNode = textoEl.childNodes[0];
    (document as unknown as { caretRangeFromPoint: () => Range }).caretRangeFromPoint = () => {
      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 0);
      return range;
    };
    fireEvent.pointerDown(container, { clientX: 0, clientY: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Tudo" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    const menu = screen.getByRole("dialog", { name: "Marcar trecho selecionado" });
    expect(
      within(menu).getByText("« No princípio era o Verbo. »"),
    ).toBeInTheDocument();
  });

  it("clicar numa cor cria um marca-texto e fecha o menu", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);

    fireEvent.click(screen.getByText("Amarelo"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const anotacoes = obterAnotacoesDoCapitulo(43, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      type: "highlight",
      versiculo: 1,
      inicio: 0,
      fim: 2,
      color: "#fef08a",
    });
    expect(screen.getByText("No")).toHaveClass("biblia-marca-texto");
  });

  it("clicar num marca-texto existente reabre o menu com a opção de remover", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);
    fireEvent.click(screen.getByText("Verde"));

    fireEvent.click(screen.getByText("No"));

    const menu = screen.getByRole("dialog", { name: "Marcar trecho selecionado" });
    expect(within(menu).getByText("Remover marcação")).toBeInTheDocument();
  });

  it("remover marcação apaga o marca-texto", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);
    fireEvent.click(screen.getByText("Amarelo"));
    fireEvent.click(screen.getByText("No"));

    fireEvent.click(screen.getByText("Remover marcação"));

    expect(obterAnotacoesDoCapitulo(43, 1)).toEqual([]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Inserir nota abre o post-it; salvar cria a nota com a cor escolhida", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);

    fireEvent.click(screen.getByText("Inserir nota"));

    const postit = screen.getByRole("dialog", { name: "Nota" });
    expect(within(postit).getByText("Nova nota")).toBeInTheDocument();
    expect(within(postit).getByRole("button", { name: "Criar nota" })).toBeDisabled();

    fireEvent.change(within(postit).getByPlaceholderText("Escreva sua nota…"), {
      target: { value: "Minha nota." },
    });
    fireEvent.click(within(postit).getByLabelText("Azul"));
    fireEvent.click(within(postit).getByRole("button", { name: "Criar nota" }));

    const anotacoes = obterAnotacoesDoCapitulo(43, 1);
    expect(anotacoes).toHaveLength(1);
    expect(anotacoes[0]).toMatchObject({
      type: "note",
      noteContent: "Minha nota.",
      highlightColor: "#bfdbfe",
    });
  });

  it("uma nota sem cor renderiza como link sublinhado; clicar nela reabre o post-it pré-preenchido", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);
    fireEvent.click(screen.getByText("Inserir nota"));
    fireEvent.change(screen.getByPlaceholderText("Escreva sua nota…"), {
      target: { value: "Nota sem cor" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar nota" }));

    const link = screen.getByText("No");
    expect(link).toHaveClass("biblia-nota-link");

    fireEvent.click(link);

    const postit = screen.getByRole("dialog", { name: "Nota" });
    expect(within(postit).getByText("Sua nota")).toBeInTheDocument();
    expect(within(postit).getByDisplayValue("Nota sem cor")).toBeInTheDocument();
    expect(within(postit).getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("excluir uma nota a remove por completo", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    selecionarPalavraNoVersiculo(1, 0);
    fireEvent.click(screen.getByText("Inserir nota"));
    fireEvent.change(screen.getByPlaceholderText("Escreva sua nota…"), {
      target: { value: "apagar" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar nota" }));

    fireEvent.click(screen.getByText("No"));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(obterAnotacoesDoCapitulo(43, 1)).toEqual([]);
  });

  it("A+ e A- ajustam o tamanho da fonte do texto", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);

    const paper = document.querySelector(".biblia-paper") as HTMLElement;
    expect(paper.style.fontSize).toBe("1rem");

    fireEvent.click(screen.getByTitle("Aumentar texto"));
    expect(paper.style.fontSize).toBe("1.15rem");

    fireEvent.click(screen.getByTitle("Diminuir texto"));
    fireEvent.click(screen.getByTitle("Diminuir texto"));
    expect(paper.style.fontSize).toBe("0.85rem");
  });

  it("o botão de alto contraste alterna a classe da página", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);

    const pagina = document.querySelector(".biblia-page")!;
    expect(pagina).not.toHaveClass("biblia-page--contraste");

    fireEvent.click(screen.getByTitle("Ativar alto contraste"));
    expect(pagina).toHaveClass("biblia-page--contraste");
  });

  it("o dropdown de tradução mostra a versão ativa e as opções bloqueadas", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);

    fireEvent.click(screen.getByRole("button", { name: "Mudar tradução da Bíblia" }));

    const painel = screen.getByRole("menu", { name: "Tradução" });
    expect(within(painel).getByText("Almeida Atualizada")).toBeInTheDocument();
    expect(within(painel).getByText(/Almeida Imprensa Bíblica.*em breve/)).toBeInTheDocument();
    expect(within(painel).getByText(/Bíblia Livre.*em breve/)).toBeInTheDocument();
  });

  it("o botão Narrar fica desabilitado quando o navegador não suporta síntese de voz", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    expect(screen.getByRole("button", { name: /Narrar/ })).toBeDisabled();
  });

  it("com síntese de voz disponível, Narrar aciona a fala e alterna para Parar", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak, cancel });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      vi.fn().mockImplementation((text: string) => ({ text })),
    );

    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);

    fireEvent.click(screen.getByRole("button", { name: /Narrar/ }));

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Parar/ })).toBeInTheDocument();
  });

  it("registra progresso de leitura ao carregar o capítulo", async () => {
    renderLeituraPage("/biblia/jhn/1");
    await screen.findByText(/No princípio era o Verbo\./);
    const barra = screen.getByRole("progressbar", { name: /Progresso de leitura/ });
    expect(barra).toHaveAttribute("aria-valuenow", "100");
  });

  it("redireciona para /biblia quando o livro não existe", () => {
    renderLeituraPage("/biblia/xxx/1");
    expect(screen.getByText("Lista de livros")).toBeInTheDocument();
  });

  it("redireciona para /biblia quando o capítulo é maior que o total do livro", () => {
    renderLeituraPage("/biblia/jhn/999");
    expect(screen.getByText("Lista de livros")).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../authentication/context/AuthContext";
import { WORDSEARCH_PUZZLES } from "../content";
import { celulasDaLinha, iniciarWordSearch } from "../engine";
import { WordSearchPlayPage } from "./WordSearchPlayPage";

const puzzle = WORDSEARCH_PUZZLES[0];

/** LCG simples e determinístico — mesma semente sempre gera a mesma sequência. */
function criarRandomDeterministico(seed = 42): () => number {
  let estado = seed;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/exercicios/caca-palavras/:id"
            element={<WordSearchPlayPage />}
          />
          <Route
            path="/exercicios/caca-palavras"
            element={<p>Lista de caça-palavras</p>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WordSearchPlayPage", () => {
  it("redireciona para a lista quando o desafio não existe", () => {
    renderPage("/exercicios/caca-palavras/inexistente");
    expect(screen.getByText("Lista de caça-palavras")).toBeInTheDocument();
  });

  it("exibe o título e a grade com o número certo de células", () => {
    renderPage(`/exercicios/caca-palavras/${puzzle.id}`);
    expect(screen.getByText(puzzle.titulo)).toBeInTheDocument();
    // grade padrão 10x10 = 100 células
    expect(document.querySelectorAll(".caca-palavras-celula")).toHaveLength(100);
  });

  it("exibe todas as palavras do desafio na lista", () => {
    renderPage(`/exercicios/caca-palavras/${puzzle.id}`);
    for (const palavra of puzzle.palavras) {
      expect(screen.getByText(palavra)).toBeInTheDocument();
    }
  });

  it("primeiro toque muda o aviso pedindo a última letra", () => {
    renderPage(`/exercicios/caca-palavras/${puzzle.id}`);
    const celulas = document.querySelectorAll(".caca-palavras-celula");
    fireEvent.click(celulas[0]);
    expect(
      screen.getByText("Agora toque na última letra da palavra."),
    ).toBeInTheDocument();
  });

  it("encontrar todas as palavras mostra a tela de resultado com a recompensa", () => {
    // Random determinístico (LCG), não uma constante: um valor fixo faz
    // toda tentativa de posicionamento repetir a MESMA posição, então o
    // laço de retentativas de `tentarColocarPalavra` nunca explora
    // alternativas e a maioria das palavras não é posicionada. Duas
    // instâncias com a mesma semente, uma alimentando `Math.random` (usado
    // pelo componente) e outra passada explicitamente para o cálculo de
    // referência abaixo, geram a MESMA grade de forma independente.
    vi.spyOn(Math, "random").mockImplementation(criarRandomDeterministico());
    const referencia = iniciarWordSearch(puzzle, 10, criarRandomDeterministico());

    renderPage(`/exercicios/caca-palavras/${puzzle.id}`);
    const celulasDom = document.querySelectorAll(".caca-palavras-celula");

    for (const alvo of referencia.palavras) {
      // Acha início/fim reais da palavra na grade determinística.
      let encontrados: [number, number] | null = null;
      for (let inicio = 0; inicio < referencia.grade.length && !encontrados; inicio++) {
        for (let fim = 0; fim < referencia.grade.length; fim++) {
          const celulas = celulasDaLinha(inicio, fim, referencia.tamanho);
          if (!celulas || celulas.length !== alvo.normalizada.length) continue;
          const texto = celulas.map((c) => referencia.grade[c]).join("");
          if (texto === alvo.normalizada) {
            encontrados = [inicio, fim];
            break;
          }
        }
      }
      expect(encontrados, alvo.normalizada).not.toBeNull();
      const [inicio, fim] = encontrados!;
      fireEvent.click(celulasDom[inicio]);
      fireEvent.click(celulasDom[fim]);
    }

    expect(screen.getByText("Caça-palavras concluído!")).toBeInTheDocument();
    expect(screen.getByText("+50 XP · +25 ouro")).toBeInTheDocument();
  });
});

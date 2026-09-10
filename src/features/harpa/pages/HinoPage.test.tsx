import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { _resetCacheParaTeste } from "../dataLoader";
import { HinoPage } from "./HinoPage";
import type { HarpaData } from "../types";

const harpaFake: HarpaData = {
  "1": {
    hino: "1 - Chuvas de Graça",
    coro: "Chuvas de graça, <br> Chuvas pedimos, Senhor;",
    verses: {
      "1": "Deus prometeu com certeza <br> Chuvas de graça mandar;",
      "2": "Cristo nos tem concedido <br> O santo Consolador,",
    },
  },
};

function renderHinoPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/harpa/:numero" element={<HinoPage />} />
          <Route path="/harpa" element={<p>Lista de hinos</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  _resetCacheParaTeste();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(harpaFake) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HinoPage", () => {
  it("exibe título, estrofes e coro intercalado", async () => {
    renderHinoPage("/harpa/1");
    expect(
      await screen.findByRole("heading", { name: "Chuvas de Graça" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Chuvas de graça,\s*Chuvas pedimos, Senhor;/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Deus prometeu com certeza/)).toBeInTheDocument();
    expect(screen.getByText(/Cristo nos tem concedido/)).toBeInTheDocument();
  });

  it("redireciona para /harpa quando o hino não existe", async () => {
    renderHinoPage("/harpa/999");
    expect(await screen.findByText("Lista de hinos")).toBeInTheDocument();
  });
});

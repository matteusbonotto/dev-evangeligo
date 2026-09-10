import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../authentication/context/AuthContext";
import { _resetCacheParaTeste } from "../dataLoader";
import { HinosPage } from "./HinosPage";
import type { HarpaData } from "../types";

const harpaFake: HarpaData = {
  "1": { hino: "1 - Chuvas de Graça", verses: { "1": "Estrofe 1." } },
  "2": { hino: "2 - Saudosa Lembrança", verses: { "1": "Estrofe 1." } },
};

function renderHinosPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HinosPage />
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

describe("HinosPage", () => {
  it("lista os hinos carregados", async () => {
    renderHinosPage();
    expect(await screen.findByText("1 — Chuvas de Graça")).toBeInTheDocument();
    expect(screen.getByText("2 — Saudosa Lembrança")).toBeInTheDocument();
  });

  it("filtra a lista pelo texto digitado na busca", async () => {
    renderHinosPage();
    await screen.findByText("1 — Chuvas de Graça");

    fireEvent.change(
      screen.getByLabelText("Buscar hino por número ou título"),
      {
        target: { value: "saudosa" },
      },
    );

    expect(screen.queryByText("1 — Chuvas de Graça")).not.toBeInTheDocument();
    expect(screen.getByText("2 — Saudosa Lembrança")).toBeInTheDocument();
  });
});

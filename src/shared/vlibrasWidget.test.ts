import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { definirPreferenciaVLibras } from "./preferencias";
import { iniciarWidgetVLibras } from "./vlibrasWidget";

/**
 * T-073 — pedido explícito do usuário depois de várias rodadas sem
 * conseguir corrigir a posição/arrasto de forma confiável em todo
 * aparelho: "desisto, bota um switch pra permitir o VLibras, se false
 * desativa o javascript dessa biblioteca". Quando desligado, NENHUM
 * elemento nem `<script>` do VLibras deve ser injetado — não é só
 * escondido via CSS.
 */
describe("iniciarWidgetVLibras", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
  });

  it("injeta o HTML e o <script> do VLibras quando habilitado (padrão)", () => {
    iniciarWidgetVLibras();

    expect(document.querySelector("[vw-access-button]")).not.toBeNull();
    expect(
      document.querySelector('script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'),
    ).not.toBeNull();
  });

  it("não injeta NADA quando o usuário desligou o VLibras", () => {
    definirPreferenciaVLibras(false);

    iniciarWidgetVLibras();

    expect(document.querySelector("[vw-access-button]")).toBeNull();
    expect(
      document.querySelector('script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'),
    ).toBeNull();
  });
});

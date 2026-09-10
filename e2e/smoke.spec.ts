import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

/**
 * Smoke test (T-019): entra como demonstração e visita cada seção da
 * navegação inferior, checando que a página carrega sem erro de console
 * e sem o HUD sumir — a rede de segurança mais barata contra uma
 * regressão que quebra o app inteiro (ex.: erro de render em `AppShell`).
 */
test.describe("Smoke: navegação principal", () => {
  test("home carrega e mostra o botão de demonstração", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Ver demonstração")).toBeVisible();
  });

  test("login demo leva ao painel com o HUD visível", async ({ page }) => {
    await loginAsDemo(page);
    await expect(page.locator(".hud-username")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  });

  const secoes: { link: RegExp; url: string }[] = [
    { link: /Trilhas/, url: "**/trilhas" },
    { link: /Bíblia/, url: "**/biblia" },
    { link: /Harpa/, url: "**/harpa" },
    { link: /Exercícios/, url: "**/exercicios" },
  ];

  for (const { link, url } of secoes) {
    test(`navegação inferior: ${link.source} carrega sem erro de console`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await loginAsDemo(page);
      await page.getByRole("link", { name: link }).click();
      await page.waitForURL(url);

      expect(consoleErrors).toEqual([]);
    });
  }

  test("sair encerra a sessão de demonstração e volta para a home", async ({
    page,
  }) => {
    await loginAsDemo(page);
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByText("Ver demonstração")).toBeVisible();
  });
});

import type { Page } from "@playwright/test";

/**
 * Entra no modo de demonstração (`AuthContext.signInDemo`, 100% em memória
 * — sem rede) e espera o dashboard carregar. Ponto de entrada comum para
 * todo fluxo E2E que precisa estar "logado".
 */
export async function loginAsDemo(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByText("Ver demonstração").click();
  await page.waitForURL("**/jornada");
  await page.waitForSelector(".hud-username");
}

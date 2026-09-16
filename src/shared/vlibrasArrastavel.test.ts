import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { iniciarVLibrasArrastavel } from "./vlibrasArrastavel";

/**
 * Bug real relatado por usuários (2026-09-16): o botão do VLibras "não se
 * move" mesmo com o script rodando sem erro. Causa raiz: o CSS injetado
 * pelo próprio widget do governo usa `!important` em posição — um valor
 * inline comum (`style.top = "..."`) nunca vence `!important` de nenhuma
 * stylesheet. Estes testes travam que toda propriedade de posicionamento
 * seja escrita com prioridade `important`, não a simples presença do
 * valor (que já passava antes da correção e não pegava a regressão).
 */
describe("iniciarVLibrasArrastavel", () => {
  let botao: HTMLDivElement;

  beforeEach(() => {
    botao = document.createElement("div");
    botao.setAttribute("vw-access-button", "");
    document.body.appendChild(botao);
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("posiciona o botão com prioridade important (senão o CSS do widget sobrescreve)", () => {
    iniciarVLibrasArrastavel();

    expect(botao.style.getPropertyPriority("position")).toBe("important");
    expect(botao.style.getPropertyPriority("top")).toBe("important");
    expect(botao.style.getPropertyPriority("bottom")).toBe("important");
    expect(botao.style.getPropertyPriority("left")).toBe("important");
    expect(botao.style.getPropertyPriority("right")).toBe("important");
  });

  it("ancora no canto salvo (padrão bottom-right) definindo os 4 eixos, nunca deixando 2 opostos ativos", () => {
    iniciarVLibrasArrastavel();

    expect(botao.style.position).toBe("fixed");
    expect(botao.style.bottom).toBe("16px");
    expect(botao.style.right).toBe("16px");
    expect(botao.style.top).toBe("auto");
    expect(botao.style.left).toBe("auto");
  });

  it("respeita um canto salvo anteriormente em localStorage", () => {
    localStorage.setItem("evangeligo:vlibras:canto", "top-left");
    iniciarVLibrasArrastavel();

    expect(botao.style.top).toBe("16px");
    expect(botao.style.left).toBe("16px");
    expect(botao.style.bottom).toBe("auto");
    expect(botao.style.right).toBe("auto");
  });

  it("torna o cursor arrastável, também com prioridade important", () => {
    iniciarVLibrasArrastavel();

    expect(botao.style.cursor).toBe("grab");
    expect(botao.style.getPropertyPriority("cursor")).toBe("important");
  });
});

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
  let pararObservador: (() => void) | null = null;

  beforeEach(() => {
    botao = document.createElement("div");
    botao.setAttribute("vw-access-button", "");
    document.body.appendChild(botao);
  });

  afterEach(() => {
    pararObservador?.();
    pararObservador = null;
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("posiciona o botão com prioridade important (senão o CSS do widget sobrescreve)", () => {
    pararObservador = iniciarVLibrasArrastavel();

    expect(botao.style.getPropertyPriority("position")).toBe("important");
    expect(botao.style.getPropertyPriority("top")).toBe("important");
    expect(botao.style.getPropertyPriority("bottom")).toBe("important");
    expect(botao.style.getPropertyPriority("left")).toBe("important");
    expect(botao.style.getPropertyPriority("right")).toBe("important");
  });

  it("ancora no canto salvo (padrão bottom-right) definindo os 4 eixos, nunca deixando 2 opostos ativos", () => {
    pararObservador = iniciarVLibrasArrastavel();

    expect(botao.style.position).toBe("fixed");
    expect(botao.style.bottom).toBe("16px");
    expect(botao.style.right).toBe("16px");
    expect(botao.style.top).toBe("auto");
    expect(botao.style.left).toBe("auto");
  });

  it("respeita um canto salvo anteriormente em localStorage", () => {
    localStorage.setItem("evangeligo:vlibras:canto", "top-left");
    pararObservador = iniciarVLibrasArrastavel();

    expect(botao.style.top).toBe("16px");
    expect(botao.style.left).toBe("16px");
    expect(botao.style.bottom).toBe("auto");
    expect(botao.style.right).toBe("auto");
  });

  it("torna o cursor arrastável, também com prioridade important", () => {
    pararObservador = iniciarVLibrasArrastavel();

    expect(botao.style.cursor).toBe("grab");
    expect(botao.style.getPropertyPriority("cursor")).toBe("important");
  });

  /**
   * Bug real relatado DEPOIS da correção acima (2026-09-16, "ainda ta
   * atrapalhando"): o botão já existe pronto no HTML estático e nosso
   * script roda antes do `DOMContentLoaded` — mas a inicialização própria
   * do widget do VLibras roda DEPOIS (nesse evento) e reescreve o `style`
   * do mesmo elemento, o que reseta a prioridade `important` daquela
   * propriedade (escrever `elemento.style.top = "x"` sempre limpa a
   * prioridade anterior). Simula exatamente isso: depois que o VLibras
   * "chega atrasado" e sobrescreve a posição, o observador de atributo
   * precisa desfazer sozinho, sem exigir um reload.
   */
  it("desfaz uma reescrita tardia de posição feita pelo próprio script do VLibras", async () => {
    pararObservador = iniciarVLibrasArrastavel();
    expect(botao.style.bottom).toBe("16px");

    // Simula a inicialização tardia do widget mexendo direto no estilo.
    botao.style.top = "0px";
    botao.style.bottom = "";
    botao.style.right = "0px";
    botao.style.left = "";

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(botao.style.bottom).toBe("16px");
    expect(botao.style.right).toBe("16px");
    expect(botao.style.top).toBe("auto");
    expect(botao.style.left).toBe("auto");
    expect(botao.style.getPropertyPriority("bottom")).toBe("important");
  });

  /**
   * T-071 — achado real: a versão anterior desligava o observador de
   * `childList` assim que achava o botão pela 1ª vez. Se o VLibras algum
   * dia substituir o elemento inteiro (não só mudar seu `style`), o botão
   * novo ficava pra sempre sem arrasto/correção nenhuma. Agora o
   * observador nunca desliga sozinho — só quando o teste manda (limpeza).
   */
  it("inicializa um botão NOVO que substitui o antigo por completo (não só desliga na 1ª vez)", async () => {
    pararObservador = iniciarVLibrasArrastavel();
    expect(botao.style.getPropertyPriority("bottom")).toBe("important");

    botao.remove();
    const botaoNovo = document.createElement("div");
    botaoNovo.setAttribute("vw-access-button", "");
    document.body.appendChild(botaoNovo);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(botaoNovo.style.position).toBe("fixed");
    expect(botaoNovo.style.bottom).toBe("16px");
    expect(botaoNovo.style.getPropertyPriority("bottom")).toBe("important");
  });

  /**
   * T-071 — causa raiz real, achada inspecionando o DOM em produção com o
   * usuário: o elemento que o widget REALMENTE posiciona como flutuante é
   * `#vlibras-access` (CSS do próprio widget: `position: fixed; top:
   * calc(50vh - 20px); right: 10px`) — `[vw-access-button]` é só o
   * placeholder estático de `index.html`. Toda correção de T-062 a T-070
   * mirava o elemento ERRADO: "funcionava" nos testes/preview porque o
   * widget real nunca carrega completo em ambiente headless (o placeholder
   * ficava sozinho, "parecendo" corrigido), mas no celular real o
   * `#vlibras-access` nunca era tocado.
   */
  it("prioriza #vlibras-access (elemento real) mesmo quando o placeholder [vw-access-button] também existe", () => {
    const acesso = document.createElement("div");
    acesso.id = "vlibras-access";
    // O real normalmente aparece DEPOIS do placeholder no DOM — reproduz
    // isso de propósito, já que `querySelector` com lista combinada
    // devolve o primeiro em ORDEM NO DOM (o bug que este teste evita).
    document.body.appendChild(acesso);

    pararObservador = iniciarVLibrasArrastavel();

    expect(acesso.style.getPropertyPriority("bottom")).toBe("important");
    expect(acesso.style.bottom).toBe("16px");
    // O placeholder nunca devia ter sido tocado, já que o real existe.
    expect(botao.style.bottom).toBe("");
  });

  it("troca pro #vlibras-access quando ele aparece depois (widget carregou de verdade)", async () => {
    pararObservador = iniciarVLibrasArrastavel();
    expect(botao.style.getPropertyPriority("bottom")).toBe("important");

    const acesso = document.createElement("div");
    acesso.id = "vlibras-access";
    document.body.appendChild(acesso);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(acesso.style.bottom).toBe("16px");
    expect(acesso.style.getPropertyPriority("bottom")).toBe("important");
  });
});

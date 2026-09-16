import { obterPreferenciaVLibras } from "./preferencias";
import { iniciarVLibrasArrastavel } from "./vlibrasArrastavel";

/**
 * Injeta o widget do VLibras (T-017) SÓ SE o usuário não desligou em
 * Perfil > Configurações (T-073). Antes, o HTML/script vinha fixo em
 * `index.html`, carregando o script do governo sempre — depois de várias
 * rodadas sem conseguir corrigir a posição/arrasto de forma confiável em
 * todo aparelho (T-062 a T-072), o usuário pediu controle direto: "se
 * false, desativa o javascript dessa biblioteca". Quando desligado, ZERO
 * requisição de rede pro domínio do VLibras acontece — não é só escondido
 * via CSS.
 */
export function iniciarWidgetVLibras(): void {
  if (!obterPreferenciaVLibras()) return;

  const wrapper = document.createElement("div");
  wrapper.setAttribute("vw", "");
  wrapper.className = "enabled";
  wrapper.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const script = document.createElement("script");
  script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  script.onload = () => {
    const vlibras = (window as unknown as { VLibras?: { Widget: new (url: string) => unknown } })
      .VLibras;
    if (vlibras) new vlibras.Widget("https://vlibras.gov.br/app");
    iniciarVLibrasArrastavel();
  };
  document.body.appendChild(script);
}

import { CATEGORIAS_AVATAR, FUNDOS_AVATAR, getFundoByValor } from "../data/opcoesAvatar";
import { montarUrlAvatar } from "../avatarUrl";
import type { AvatarConfig, CategoriaAvatar } from "../types";

/**
 * Preview + seletores de customização do avatar — extraído de
 * `AvatarEditorPage.tsx` (T-033) para ser reaproveitado também no 10º
 * passo do onboarding (T-077b), que usa só um subconjunto de `categorias`
 * (curadoria pra não virar um formulário gigante no meio do cadastro) e
 * guarda a escolha em memória em vez de `updateUser` (que exige sessão).
 */
export function AvatarCustomizador({
  config,
  onEscolher,
  onEscolherFundo,
  categorias = CATEGORIAS_AVATAR,
  mostrarFundo = true,
}: {
  config: AvatarConfig;
  onEscolher: (campo: keyof Omit<AvatarConfig, "fundo">, valor: string) => void;
  onEscolherFundo: (valor: string) => void;
  categorias?: CategoriaAvatar[];
  mostrarFundo?: boolean;
}) {
  const fundoAtual = getFundoByValor(config.fundo);

  return (
    <>
      <div className="avatar-preview" style={{ background: fundoAtual.gradient }}>
        <img
          src={montarUrlAvatar(config)}
          alt="Prévia do seu avatar"
          className="avatar-preview-img"
        />
      </div>

      {mostrarFundo && (
        <div className="avatar-categoria">
          <p className="avatar-categoria-label">Fundo</p>
          <div className="avatar-opcoes avatar-opcoes--cor" role="group" aria-label="Fundo">
            {FUNDOS_AVATAR.map((fundo) => (
              <button
                key={fundo.valor}
                type="button"
                className={`avatar-swatch${config.fundo === fundo.valor ? " avatar-swatch--ativo" : ""}`}
                style={{ background: fundo.gradient }}
                aria-pressed={config.fundo === fundo.valor}
                aria-label={fundo.label}
                title={fundo.label}
                onClick={() => onEscolherFundo(fundo.valor)}
              />
            ))}
          </div>
        </div>
      )}

      {categorias.map((categoria) => {
        const temCor = categoria.opcoes.some((o) => o.hex);
        return (
          <div className="avatar-categoria" key={categoria.campo}>
            <p className="avatar-categoria-label">{categoria.label}</p>
            <div
              className={`avatar-opcoes${temCor ? " avatar-opcoes--cor" : " avatar-opcoes--visual"}`}
              role="group"
              aria-label={categoria.label}
            >
              {categoria.opcoes.map((opcao) =>
                temCor ? (
                  <button
                    key={opcao.valor}
                    type="button"
                    className={`avatar-swatch${config[categoria.campo] === opcao.valor ? " avatar-swatch--ativo" : ""}`}
                    style={{ background: opcao.hex }}
                    aria-pressed={config[categoria.campo] === opcao.valor}
                    aria-label={opcao.label}
                    title={opcao.label}
                    onClick={() => onEscolher(categoria.campo, opcao.valor)}
                  />
                ) : (
                  <button
                    key={opcao.valor}
                    type="button"
                    className={`avatar-opcao-visual${config[categoria.campo] === opcao.valor ? " avatar-opcao-visual--ativa" : ""}`}
                    aria-pressed={config[categoria.campo] === opcao.valor}
                    title={opcao.label}
                    onClick={() => onEscolher(categoria.campo, opcao.valor)}
                  >
                    <img
                      className="avatar-opcao-visual-img"
                      src={montarUrlAvatar({ ...config, [categoria.campo]: opcao.valor })}
                      alt=""
                      loading="lazy"
                    />
                    <span className="avatar-opcao-visual-label">{opcao.label}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

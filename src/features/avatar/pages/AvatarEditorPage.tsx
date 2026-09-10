import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import "../avatar.css";
import {
  CATEGORIAS_AVATAR,
  FUNDOS_AVATAR,
  getFundoByValor,
} from "../data/opcoesAvatar";
import { obterConfigAvatar, salvarConfigAvatar } from "../avatarConfig";
import { montarUrlAvatar } from "../avatarUrl";
import { AppShell } from "../../../shared/components/AppShell";
import { ROUTE_PATHS } from "../../../app/routePaths";
import type { AvatarConfig } from "../types";

/**
 * Criação/edição de personagem (T-033) — pedido explícito do usuário,
 * comparando com o app legado. Usa a mesma biblioteca do legado
 * ("Avataaars", `avatarUrl.ts`) e as mesmas categorias
 * (`data/opcoesAvatar.ts`). Salva a cada escolha (`avatarConfig.ts`,
 * localStorage) — ver limitação de persistência no cabeçalho daquele
 * arquivo.
 */
export function AvatarEditorPage() {
  const [config, setConfig] = useState<AvatarConfig>(() => obterConfigAvatar());

  function handleEscolher(
    campo: keyof Omit<AvatarConfig, "fundo">,
    valor: string,
  ) {
    setConfig((atual) => {
      const proximo = { ...atual, [campo]: valor };
      salvarConfigAvatar(proximo);
      return proximo;
    });
  }

  function handleEscolherFundo(valor: string) {
    setConfig((atual) => {
      const proximo = { ...atual, fundo: valor };
      salvarConfigAvatar(proximo);
      return proximo;
    });
  }

  const fundoAtual = getFundoByValor(config.fundo);

  return (
    <AppShell>
      <div className="dashboard">
        <Link className="back-link" to={ROUTE_PATHS.dashboard}>
          <FiArrowLeft aria-hidden="true" /> Início
        </Link>

        <section
          className="dash-card avatar-editor"
          aria-labelledby="avatar-title"
        >
          <p className="eyebrow">
            <FiUser aria-hidden="true" /> Personagem
          </p>
          <h1 id="avatar-title">Personalize seu avatar</h1>

          <div
            className="avatar-preview"
            style={{ background: fundoAtual.gradient }}
          >
            <img
              src={montarUrlAvatar(config)}
              alt="Prévia do seu avatar"
              className="avatar-preview-img"
            />
          </div>

          <div className="avatar-categoria">
            <p className="avatar-categoria-label">Fundo</p>
            <div
              className="avatar-opcoes avatar-opcoes--cor"
              role="group"
              aria-label="Fundo"
            >
              {FUNDOS_AVATAR.map((fundo) => (
                <button
                  key={fundo.valor}
                  type="button"
                  className={`avatar-swatch${config.fundo === fundo.valor ? " avatar-swatch--ativo" : ""}`}
                  style={{ background: fundo.gradient }}
                  aria-pressed={config.fundo === fundo.valor}
                  aria-label={fundo.label}
                  title={fundo.label}
                  onClick={() => handleEscolherFundo(fundo.valor)}
                />
              ))}
            </div>
          </div>

          {CATEGORIAS_AVATAR.map((categoria) => {
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
                        onClick={() =>
                          handleEscolher(categoria.campo, opcao.valor)
                        }
                      />
                    ) : (
                      // Miniatura ao vivo por opção (como o legado —
                      // "cada chip mostra uma prévia real de como o
                      // personagem ficaria"), não um pill de texto puro:
                      // monta a MESMA config atual trocando só este campo.
                      <button
                        key={opcao.valor}
                        type="button"
                        className={`avatar-opcao-visual${config[categoria.campo] === opcao.valor ? " avatar-opcao-visual--ativa" : ""}`}
                        aria-pressed={config[categoria.campo] === opcao.valor}
                        title={opcao.label}
                        onClick={() =>
                          handleEscolher(categoria.campo, opcao.valor)
                        }
                      >
                        <img
                          className="avatar-opcao-visual-img"
                          src={montarUrlAvatar({
                            ...config,
                            [categoria.campo]: opcao.valor,
                          })}
                          alt=""
                          loading="lazy"
                        />
                        <span className="avatar-opcao-visual-label">
                          {opcao.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            );
          })}

          <Link className="primary-button full" to={ROUTE_PATHS.dashboard}>
            Salvar personagem
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../onboarding.css";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../context/AuthContext";
import { PRIVACY_VERSION, TERMS_VERSION } from "../domain/legalVersions";
import {
  ESTADOS_CIVIS,
  OBJETIVOS,
  ONBOARDING_STEP_SCHEMAS,
  ONBOARDING_TOTAL_PASSOS,
  type OnboardingFormValues,
} from "../domain/onboardingSchemas";
import {
  evaluatePasswordStrength,
  type PasswordStrengthResult,
} from "../domain/passwordStrength";

const VALORES_INICIAIS: OnboardingFormValues = {
  aceitaTermos: false,
  aceitaPrivacidade: false,
  nome: "",
  sobrenome: "",
  nascimento: "",
  email: "",
  password: "",
  confirmPassword: "",
  estadoCivil: "",
  objetivo: "",
};

type Erros = Partial<Record<keyof OnboardingFormValues, string>>;

/**
 * Sequência de passos para quem já chegou aqui com sessão do Google
 * (T-043/ADR-037, `?google=1`, vindo de `AuthCallbackPage`) — pula nome/
 * sobrenome (1), e-mail (3) e senha (4), que já vieram do Google/não
 * existem nessa conta. Termos (0), nascimento (2), estado civil (5) e
 * objetivo (6) continuam sendo pedidos normalmente: o Google não coleta
 * aceite dos NOSSOS termos, nem esses dados específicos do app.
 */
const PASSOS_GOOGLE = [0, 2, 5, 6] as const;

/**
 * Onboarding estilo Duolingo (T-006, 7 passos): boas-vindas/termos, nome,
 * nascimento, e-mail, senha, estado civil, objetivo — substitui a antiga
 * `SignUpPage` (uma tela só) como fluxo principal de `/cadastro`. Migrado
 * do app legado (`passoCadastro`/`avancarCadastro()`/`finalizarCadastro()`
 * em `app.js`): todos os campos ficam em memória local; a conta só é
 * criada de fato no passo final, numa única chamada (ver
 * `domain/onboardingSchemas.ts` para o porquê dessa arquitetura). Único
 * desvio deliberado do legado: o 7º passo é "objetivo" em vez de criação
 * de avatar (que já existe como feature própria, `/avatar`, T-033).
 */
export function OnboardingPage() {
  const {
    signUpWithPassword,
    signInWithGoogle,
    completarCadastroGoogle,
    isAuthenticated,
    supabaseUser,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modoGoogle = searchParams.get("google") === "1";

  const [passo, setPasso] = useState(0);
  const [valores, setValores] = useState<OnboardingFormValues>(VALORES_INICIAIS);
  const [erros, setErros] = useState<Erros>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Fora do modo Google, chegar aqui autenticado (ex.: sessão de outra aba)
  // manda pro dashboard — no modo Google a pessoa JÁ chega autenticada de
  // propósito (veio do redirect do OAuth) e precisamos que ela fique aqui
  // até terminar os passos que faltam (ver `finalizarCadastro`, que navega
  // pro dashboard manualmente ao concluir).
  useEffect(() => {
    if (isAuthenticated && !modoGoogle) {
      navigate(ROUTE_PATHS.dashboard, { replace: true });
    }
  }, [isAuthenticated, navigate, modoGoogle]);

  // Pré-preenche nome/sobrenome/e-mail com o que o Google já forneceu —
  // os passos 1/3/4 continuam existindo no estado (`OnboardingFormValues`)
  // mesmo pulados, porque `finalizarCadastro` não os usa no modo Google.
  useEffect(() => {
    if (!modoGoogle || !supabaseUser) return;
    const metadata = supabaseUser.user_metadata as {
      full_name?: string;
      name?: string;
    };
    const nomeCompleto = metadata.full_name || metadata.name || "";
    const [primeiroNome, ...resto] = nomeCompleto.trim().split(/\s+/);
    setValores((atual) => ({
      ...atual,
      nome: atual.nome || primeiroNome || "",
      sobrenome: atual.sobrenome || resto.join(" "),
      email: atual.email || supabaseUser.email || "",
    }));
  }, [modoGoogle, supabaseUser]);

  useEffect(() => {
    tituloRef.current?.focus();
  }, [passo]);

  function proximoPasso(atual: number): number {
    if (!modoGoogle) return atual + 1;
    const indice = PASSOS_GOOGLE.indexOf(atual as (typeof PASSOS_GOOGLE)[number]);
    return PASSOS_GOOGLE[indice + 1] ?? atual;
  }

  function passoAnterior(atual: number): number {
    if (!modoGoogle) return Math.max(0, atual - 1);
    const indice = PASSOS_GOOGLE.indexOf(atual as (typeof PASSOS_GOOGLE)[number]);
    return PASSOS_GOOGLE[Math.max(0, indice - 1)];
  }

  const totalPassosEfetivo = modoGoogle
    ? PASSOS_GOOGLE.length
    : ONBOARDING_TOTAL_PASSOS;
  const passoAtualEfetivo = modoGoogle
    ? PASSOS_GOOGLE.indexOf(passo as (typeof PASSOS_GOOGLE)[number]) + 1
    : passo + 1;
  const ehUltimoPasso = modoGoogle
    ? passo === PASSOS_GOOGLE[PASSOS_GOOGLE.length - 1]
    : passo === ONBOARDING_TOTAL_PASSOS - 1;

  const strength = useMemo<PasswordStrengthResult>(
    () => evaluatePasswordStrength(valores.password),
    [valores.password],
  );

  function atualizar<K extends keyof OnboardingFormValues>(
    campo: K,
    valor: OnboardingFormValues[K],
  ) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => {
      if (!(campo in atual)) return atual;
      const proximo = { ...atual };
      delete proximo[campo];
      return proximo;
    });
  }

  function validarPassoAtual(): boolean {
    const schema = ONBOARDING_STEP_SCHEMAS[passo];
    const resultado = schema.safeParse(valores);
    if (resultado.success) {
      setErros({});
      return true;
    }
    const novosErros: Erros = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0];
      if (typeof campo === "string") {
        novosErros[campo as keyof OnboardingFormValues] = issue.message;
      }
    }
    setErros(novosErros);
    return false;
  }

  async function finalizarCadastro() {
    setFormError(null);
    setIsSubmitting(true);

    if (modoGoogle) {
      const resultado = await completarCadastroGoogle({
        termosVersao: TERMS_VERSION,
        privacidadeVersao: PRIVACY_VERSION,
        nascimento: valores.nascimento || undefined,
        estadoCivil: valores.estadoCivil || undefined,
        objetivo: valores.objetivo || undefined,
      });
      setIsSubmitting(false);
      if (!resultado.ok) {
        setFormError(
          resultado.message ?? "Não foi possível concluir seu cadastro.",
        );
        return;
      }
      // Já existe sessão (veio do redirect do Google) — sem confirmação de
      // e-mail pendente para esperar, diferente do cadastro por senha abaixo.
      navigate(ROUTE_PATHS.dashboard, { replace: true });
      return;
    }

    const resultado = await signUpWithPassword({
      nome: valores.nome,
      sobrenome: valores.sobrenome,
      email: valores.email,
      password: valores.password,
      termosVersao: TERMS_VERSION,
      privacidadeVersao: PRIVACY_VERSION,
      nascimento: valores.nascimento || undefined,
      estadoCivil: valores.estadoCivil || undefined,
      objetivo: valores.objetivo || undefined,
    });
    setIsSubmitting(false);
    if (!resultado.ok) {
      setFormError(resultado.message ?? "Não foi possível criar sua conta.");
      return;
    }
    // O Supabase pode exigir confirmação de e-mail antes de liberar sessão;
    // nesse caso não há sessão imediata, então mostramos uma mensagem em vez
    // de navegar direto (o efeito acima navega sozinho se a sessão vier a
    // ficar ativa, ex.: projeto com confirmação automática).
    setSuccessMessage(
      "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
    );
  }

  async function handleAvancar() {
    if (!validarPassoAtual()) return;
    if (!ehUltimoPasso) {
      setPasso(proximoPasso(passo));
      return;
    }
    await finalizarCadastro();
  }

  function handleVoltar() {
    setErros({});
    setFormError(null);
    setPasso(passoAnterior(passo));
  }

  async function handleGoogle() {
    setFormError(null);
    setIsGoogleLoading(true);
    const resultado = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (!resultado.ok) {
      setFormError(resultado.message ?? "Não foi possível continuar com o Google.");
    }
  }

  const percentual = Math.round(
    (passoAtualEfetivo / totalPassosEfetivo) * 100,
  );

  if (successMessage) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p className="eyebrow">EvangeliGO</p>
          <h1>Quase lá!</h1>
          <p className="form-success" role="status">
            {successMessage}
          </p>
          <p className="auth-switch">
            <Link to={ROUTE_PATHS.signIn}>Ir para a tela de entrada</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <Link className="back-link" to={ROUTE_PATHS.home}>
        ← Início
      </Link>
      <div className="auth-card">
        <div className="onboarding-topo">
          {passo > 0 && (
            <button
              type="button"
              className="onboarding-voltar"
              onClick={handleVoltar}
              aria-label="Voltar ao passo anterior"
            >
              <FiArrowLeft aria-hidden="true" />
            </button>
          )}
          <div
            className="onboarding-progresso-track"
            role="progressbar"
            aria-label="Progresso do cadastro"
            aria-valuenow={percentual}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="onboarding-progresso-fill"
              style={{ width: `${percentual}%` }}
            />
          </div>
          <span className="onboarding-contador">
            {passoAtualEfetivo} / {totalPassosEfetivo}
          </span>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleAvancar();
          }}
          noValidate
        >
          {passo === 0 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Bem-vindo(a) ao EvangeliGO
              </h1>
              <p className="onboarding-passo-subtitulo">
                Antes de começar, precisamos do seu aceite dos nossos documentos.
              </p>

              <label className="field field-checkbox">
                <input
                  type="checkbox"
                  checked={valores.aceitaTermos}
                  onChange={(event) =>
                    atualizar("aceitaTermos", event.target.checked)
                  }
                />
                <span>
                  Li e aceito os{" "}
                  <Link to={ROUTE_PATHS.terms}>Termos de Uso</Link>.
                </span>
              </label>
              {erros.aceitaTermos && (
                <span className="field-error">{erros.aceitaTermos}</span>
              )}

              <label className="field field-checkbox">
                <input
                  type="checkbox"
                  checked={valores.aceitaPrivacidade}
                  onChange={(event) =>
                    atualizar("aceitaPrivacidade", event.target.checked)
                  }
                />
                <span>
                  Li e aceito a{" "}
                  <Link to={ROUTE_PATHS.privacy}>Política de Privacidade</Link>.
                </span>
              </label>
              {erros.aceitaPrivacidade && (
                <span className="field-error">{erros.aceitaPrivacidade}</span>
              )}
            </>
          )}

          {passo === 1 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Como podemos te chamar?
              </h1>
              <div className="field-row">
                <label className="field">
                  <span>Nome</span>
                  <input
                    type="text"
                    autoComplete="given-name"
                    placeholder="Seu nome"
                    value={valores.nome}
                    onChange={(event) => atualizar("nome", event.target.value)}
                    aria-invalid={erros.nome ? "true" : "false"}
                  />
                  {erros.nome && <span className="field-error">{erros.nome}</span>}
                </label>
                <label className="field">
                  <span>Sobrenome</span>
                  <input
                    type="text"
                    autoComplete="family-name"
                    placeholder="Seu sobrenome (opcional)"
                    value={valores.sobrenome}
                    onChange={(event) =>
                      atualizar("sobrenome", event.target.value)
                    }
                    aria-invalid={erros.sobrenome ? "true" : "false"}
                  />
                  {erros.sobrenome && (
                    <span className="field-error">{erros.sobrenome}</span>
                  )}
                </label>
              </div>
            </>
          )}

          {passo === 2 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Quando você nasceu?
              </h1>
              <p className="onboarding-dica-opcional">
                Opcional — você pode pular esta etapa.
              </p>
              <label className="field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  value={valores.nascimento}
                  onChange={(event) =>
                    atualizar("nascimento", event.target.value)
                  }
                  aria-invalid={erros.nascimento ? "true" : "false"}
                />
                {erros.nascimento && (
                  <span className="field-error">{erros.nascimento}</span>
                )}
              </label>
            </>
          )}

          {passo === 3 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Qual é o seu e-mail?
              </h1>
              <label className="field">
                <span>E-mail</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={valores.email}
                  onChange={(event) => atualizar("email", event.target.value)}
                  aria-invalid={erros.email ? "true" : "false"}
                />
                {erros.email && <span className="field-error">{erros.email}</span>}
              </label>
            </>
          )}

          {passo === 4 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Crie uma senha
              </h1>
              <label className="field">
                <span>Senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Crie uma senha"
                  value={valores.password}
                  onChange={(event) =>
                    atualizar("password", event.target.value)
                  }
                  aria-invalid={erros.password ? "true" : "false"}
                />
                {valores.password && (
                  <span
                    className={`password-strength password-strength--${strength.level}`}
                  >
                    Força da senha: {strength.label}
                  </span>
                )}
                {erros.password && (
                  <span className="field-error">{erros.password}</span>
                )}
              </label>
              <label className="field">
                <span>Confirmar senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={valores.confirmPassword}
                  onChange={(event) =>
                    atualizar("confirmPassword", event.target.value)
                  }
                  aria-invalid={erros.confirmPassword ? "true" : "false"}
                />
                {erros.confirmPassword && (
                  <span className="field-error">{erros.confirmPassword}</span>
                )}
              </label>
            </>
          )}

          {passo === 5 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                Qual é o seu estado civil?
              </h1>
              <p className="onboarding-dica-opcional">
                Opcional — você pode pular esta etapa.
              </p>
              <div className="onboarding-opcoes" role="group" aria-label="Estado civil">
                {ESTADOS_CIVIS.map(({ valor, label }) => (
                  <button
                    key={valor}
                    type="button"
                    className={`onboarding-opcao${valores.estadoCivil === valor ? " onboarding-opcao--ativa" : ""}`}
                    aria-pressed={valores.estadoCivil === valor}
                    onClick={() => {
                      atualizar("estadoCivil", valor);
                      setPasso((atual) => proximoPasso(atual));
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {passo === 6 && (
            <>
              <h1 className="onboarding-passo-titulo" ref={tituloRef} tabIndex={-1}>
                O que te trouxe até aqui?
              </h1>
              <div className="onboarding-opcoes" role="group" aria-label="Objetivo">
                {OBJETIVOS.map(({ valor, label }) => (
                  <button
                    key={valor}
                    type="button"
                    className={`onboarding-opcao${valores.objetivo === valor ? " onboarding-opcao--ativa" : ""}`}
                    aria-pressed={valores.objetivo === valor}
                    onClick={() => atualizar("objetivo", valor)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {erros.objetivo && (
                <span className="field-error">{erros.objetivo}</span>
              )}
            </>
          )}

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="onboarding-acoes">
            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {!ehUltimoPasso
                ? "Continuar"
                : isSubmitting
                  ? modoGoogle
                    ? "Concluindo..."
                    : "Criando conta..."
                  : "Concluir cadastro"}
            </button>
          </div>
        </form>

        {passo === 0 && !modoGoogle && (
          <>
            <div className="auth-divider" role="separator">
              <span>ou</span>
            </div>
            <button
              className="secondary-button full auth-google-button"
              type="button"
              onClick={handleGoogle}
              disabled={isGoogleLoading}
            >
              <FcGoogle aria-hidden="true" size={18} />
              {isGoogleLoading ? "Redirecionando..." : "Continuar com o Google"}
            </button>
          </>
        )}

        <p className="auth-switch">
          Já tem conta? <Link to={ROUTE_PATHS.signIn}>Entrar</Link>
        </p>
      </div>
    </main>
  );
}

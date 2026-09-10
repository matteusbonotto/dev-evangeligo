import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../context/AuthContext";
import { signInSchema, type SignInFormValues } from "../domain/authSchemas";
import { AUTH_ROUTE_PATHS } from "../routePaths";

export function SignInPage() {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInFormValues) {
    setFormError(null);
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      applyIssues(parsed.error.issues, setError);
      return;
    }

    const result = await signInWithPassword(parsed.data);
    if (!result.ok) {
      setFormError(result.message ?? "Não foi possível entrar.");
      return;
    }
    navigate(ROUTE_PATHS.dashboard);
  }

  async function handleGoogleSignIn() {
    setFormError(null);
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (!result.ok) {
      setFormError(result.message ?? "Não foi possível entrar com o Google.");
    }
    // Em caso de sucesso o navegador é redirecionado pelo Supabase/Google.
  }

  return (
    <main className="auth-page">
      <Link className="back-link" to={ROUTE_PATHS.home}>
        ← Início
      </Link>
      <div className="auth-card">
        <p className="eyebrow">EvangeliGO</p>
        <h1>Entrar</h1>
        <p className="auth-subtitle">Continue sua jornada de onde parou.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>
          <p className="auth-forgot-link">
            <Link to={AUTH_ROUTE_PATHS.forgotPassword}>Esqueceu a senha?</Link>
          </p>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <button
            className="primary-button full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-divider" role="separator">
          <span>ou</span>
        </div>

        <button
          className="secondary-button full auth-google-button"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          <FcGoogle aria-hidden="true" size={18} />
          {isGoogleLoading ? "Redirecionando..." : "Entrar com o Google"}
        </button>

        <p className="auth-switch">
          Ainda não tem conta? <Link to={ROUTE_PATHS.signUp}>Criar conta</Link>
        </p>
      </div>
    </main>
  );
}

function applyIssues(
  issues: { path: (string | number)[]; message: string }[],
  setError: (field: "email" | "password", error: { message: string }) => void,
) {
  for (const issue of issues) {
    const field = issue.path[0];
    if (field === "email" || field === "password") {
      setError(field, { message: issue.message });
    }
  }
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../context/AuthContext";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../domain/authSchemas";

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ defaultValues: { email: "" } });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null);
    setSuccessMessage(null);
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue) {
        setError("email", { message: issue.message });
      }
      return;
    }

    const result = await sendPasswordResetEmail(parsed.data.email);
    if (!result.ok) {
      setFormError(result.message ?? "Não foi possível enviar o e-mail.");
      return;
    }

    // Mensagem neutra por design: não confirma nem nega se o e-mail existe
    // na base (evita enumeração de contas cadastradas).
    setSuccessMessage(
      "Se este e-mail estiver cadastrado, você receberá um link de recuperação em instantes.",
    );
  }

  return (
    <main className="auth-page">
      <Link className="back-link" to={ROUTE_PATHS.signIn}>
        ← Entrar
      </Link>
      <div className="auth-card">
        <p className="eyebrow">EvangeliGO</p>
        <h1>Recuperar senha</h1>
        <p className="auth-subtitle">
          Informe seu e-mail para receber um link de redefinição de senha.
        </p>
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

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          {successMessage && (
            <p className="form-success" role="status">
              {successMessage}
            </p>
          )}

          <button
            className="primary-button full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <p className="auth-switch">
          Lembrou a senha? <Link to={ROUTE_PATHS.signIn}>Entrar</Link>
        </p>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../app/routePaths";
import { useAuth } from "../context/AuthContext";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../domain/authSchemas";

/**
 * Etapa final da recuperação de senha (RF-04): a página para onde o link do
 * e-mail enviado por `ForgotPasswordPage` redireciona. O Supabase já
 * autentica o usuário com uma sessão de recuperação temporária antes de
 * chegar aqui (via `detectSessionInUrl`, configurado em
 * `src/infrastructure/supabase/client.ts`); esta tela só precisa coletar a
 * nova senha e chamar `updatePassword`.
 *
 * Ainda não ligada a nenhuma rota — ver `AUTH_ROUTE_PATHS.resetPassword`
 * (`/redefinir-senha`) e o relatório da T-005 para a integração final em
 * `src/app/AppRouter.tsx`.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null);
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "password" || field === "confirmPassword") {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    const result = await updatePassword(parsed.data.password);
    if (!result.ok) {
      setFormError(result.message ?? "Não foi possível redefinir a senha.");
      return;
    }
    navigate(ROUTE_PATHS.signIn);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">EvangeliGO</p>
        <h1>Definir nova senha</h1>
        <p className="auth-subtitle">Escolha uma nova senha para sua conta.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field">
            <span>Nova senha</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nova senha"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>
          <label className="field">
            <span>Confirmar nova senha</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repita a nova senha"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>

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
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to={ROUTE_PATHS.signIn}>Voltar para o login</Link>
        </p>
      </div>
    </main>
  );
}

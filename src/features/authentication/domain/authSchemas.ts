import { z } from "zod";

/**
 * Schemas de validação de autenticação (Zod).
 *
 * Regra de arquitetura (ver `IA/docs/architecture.md`): regras de domínio não
 * dependem de React, navegador ou Supabase — este módulo deve continuar
 * testável isoladamente com `vitest`.
 */

const EMAIL_MAX_LENGTH = 254;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;
export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72; // limite prático do bcrypt usado pelo Supabase Auth.

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .max(EMAIL_MAX_LENGTH, "E-mail muito longo.")
  .email("Informe um e-mail válido.");

export const nameFieldSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, `Informe pelo menos ${NAME_MIN_LENGTH} caracteres.`)
  .max(NAME_MAX_LENGTH, "Nome muito longo.");

/**
 * Senha forte: comprimento mínimo + letra minúscula + maiúscula + número.
 * Não exige caractere especial (fricção alta sem ganho real de segurança
 * proporcional para este produto) — ver `evaluatePasswordStrength` para um
 * medidor de força não bloqueante mostrado ao usuário.
 */
export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .max(PASSWORD_MAX_LENGTH, "A senha deve ter no máximo 72 caracteres.")
  .refine((value) => /[a-z]/.test(value), {
    message: "A senha deve conter uma letra minúscula.",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "A senha deve conter uma letra maiúscula.",
  })
  .refine((value) => /\d/.test(value), {
    message: "A senha deve conter um número.",
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha."),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    nome: nameFieldSchema,
    sobrenome: nameFieldSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha."),
    aceitaTermos: z.boolean().refine((value) => value === true, {
      message: "É necessário aceitar os Termos de Uso.",
    }),
    aceitaPrivacidade: z.boolean().refine((value) => value === true, {
      message: "É necessário aceitar a Política de Privacidade.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Medidor de força de senha — heurística simples, não bloqueante, usada como
 * feedback visual no cadastro. A validação que efetivamente bloqueia o envio
 * do formulário vive em `authSchemas.ts` (`passwordSchema`).
 *
 * Regra de arquitetura: função pura, sem dependência de React/navegador.
 */

export type PasswordStrengthLevel =
  "muito-fraca" | "fraca" | "razoavel" | "forte" | "muito-forte";

export interface PasswordStrengthResult {
  /** 0 (mais fraca) a 4 (mais forte). */
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}

const LEVELS: Array<{ level: PasswordStrengthLevel; label: string }> = [
  { level: "muito-fraca", label: "Muito fraca" },
  { level: "fraca", label: "Fraca" },
  { level: "razoavel", label: "Razoável" },
  { level: "forte", label: "Forte" },
  { level: "muito-forte", label: "Muito forte" },
];

export function evaluatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const clampedIndex = Math.min(score, LEVELS.length - 1);
  const { level, label } = LEVELS[clampedIndex];

  return { score: clampedIndex, level, label };
}

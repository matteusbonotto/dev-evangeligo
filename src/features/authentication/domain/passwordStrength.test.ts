import { describe, expect, it } from "vitest";
import { evaluatePasswordStrength } from "./passwordStrength";

describe("evaluatePasswordStrength", () => {
  it("classifica senha vazia como muito fraca", () => {
    const result = evaluatePasswordStrength("");
    expect(result.level).toBe("muito-fraca");
    expect(result.score).toBe(0);
  });

  it("classifica senha curta e simples como fraca ou muito fraca", () => {
    const result = evaluatePasswordStrength("abc");
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it("classifica senha longa, mista e numérica como forte", () => {
    const result = evaluatePasswordStrength("SenhaForte123");
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it("classifica senha longa com símbolos como muito forte", () => {
    const result = evaluatePasswordStrength("Senha!Muito#Forte123");
    expect(result.level).toBe("muito-forte");
    expect(result.score).toBe(4);
  });

  it("nunca excede o score máximo (4)", () => {
    const result = evaluatePasswordStrength(
      "Senha!!!MuitoLonga###Com123ExtraCaracteres???",
    );
    expect(result.score).toBeLessThanOrEqual(4);
  });

  it("é uma função pura (mesma entrada produz mesma saída)", () => {
    const a = evaluatePasswordStrength("Teste123");
    const b = evaluatePasswordStrength("Teste123");
    expect(a).toEqual(b);
  });
});

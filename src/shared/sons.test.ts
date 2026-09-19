import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { definirPreferenciaSons } from "./preferencias";
import { tocarSom } from "./sons";

describe("tocarSom", () => {
  let playMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    playMock = vi.fn().mockResolvedValue(undefined);
    class AudioMock {
      currentTime = 0;
      preload = "";
      constructor(public src: string) {}
      play() {
        return playMock();
      }
    }
    vi.stubGlobal("Audio", AudioMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("toca o som quando a preferência está ligada (padrão)", () => {
    tocarSom("sucesso");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("não toca nada quando a preferência está desligada", () => {
    definirPreferenciaSons(false);
    tocarSom("sucesso");
    expect(playMock).not.toHaveBeenCalled();
  });

  it("não lança erro se Audio.play() rejeitar (autoplay bloqueado)", () => {
    playMock.mockRejectedValue(new Error("bloqueado"));
    expect(() => tocarSom("erro")).not.toThrow();
  });
});

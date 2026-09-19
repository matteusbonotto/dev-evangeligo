import { obterPreferenciaSons } from "./preferencias";

/**
 * Efeitos sonoros curtos, estilo Duolingo (pedido explícito do usuário —
 * "quero os efeitos mais parecidos com o duolingo"). Arquivos em
 * `public/sounds/*.wav`, gerados por síntese própria (sem download de
 * terceiros — elimina qualquer dúvida de licença/atribuição, ver
 * `IA/memory/decisions.md`). O usuário pode SUBSTITUIR qualquer arquivo
 * mantendo o mesmo nome, sem precisar tocar em código nenhum.
 *
 * Respeita a preferência em `preferencias.ts` (`Efeitos sonoros`, Perfil
 * > Configurações) — quando desligada, `tocarSom` não faz nada.
 */
export type NomeSom =
  | "sucesso"
  | "erro"
  | "falha"
  | "aviso"
  | "conquista"
  | "concluido"
  | "notificacao";

const CAMINHO_BASE = `${import.meta.env.BASE_URL}sounds/`;

const cache = new Map<NomeSom, HTMLAudioElement>();

function obterAudio(nome: NomeSom): HTMLAudioElement {
  let audio = cache.get(nome);
  if (!audio) {
    audio = new Audio(`${CAMINHO_BASE}${nome}.wav`);
    audio.preload = "auto";
    cache.set(nome, audio);
  }
  return audio;
}

/**
 * Toca um efeito sonoro, se a preferência do usuário permitir. Silencioso
 * em qualquer erro (ex.: autoplay bloqueado pelo navegador antes de
 * qualquer interação, arquivo ausente) — som é sempre um extra, nunca deve
 * quebrar o fluxo do app.
 */
export function tocarSom(nome: NomeSom): void {
  if (!obterPreferenciaSons()) return;
  if (typeof Audio === "undefined") return;
  try {
    const audio = obterAudio(nome);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay bloqueado ou arquivo indisponível — ignora silenciosamente.
    });
  } catch {
    // Idem — nunca deixar um som quebrar a funcionalidade real.
  }
}

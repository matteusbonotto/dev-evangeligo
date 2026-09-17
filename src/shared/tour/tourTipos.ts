/**
 * Motor de tour guiado (T-077) — pedido explícito do usuário: "um tour
 * tutorial que escurece o app, mostra os elementos, e um balão flexível
 * com a explicação... isso servirá para o app inteiro". Um `TourPasso`
 * aponta pro elemento a destacar via `data-tour="<nome>"` (convenção
 * nova, mais estável que depender de classes CSS que podem mudar de
 * estilo sem aviso).
 */
export interface TourPasso {
  /** Seletor CSS do elemento a destacar — convenção: `[data-tour="nome"]`. */
  seletor: string;
  titulo: string;
  texto: string;
}

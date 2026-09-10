/**
 * Marca "EvangeliGO" (logo + nome), reutilizada em todo cabeçalho da
 * aplicação. `alt=""`: a logo é decorativa ao lado do nome já visível em
 * texto — evitar leitura duplicada por leitor de tela.
 */
export function BrandMark() {
  return (
    <>
      <img src="/logo.png" alt="" className="brand-logo" />
      EvangeliGO
    </>
  );
}

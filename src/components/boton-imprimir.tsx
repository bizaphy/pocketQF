// Abre el diálogo de impresión del navegador (desde ahí también se puede guardar como PDF).
"use client";

export default function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew hover:bg-deep-space/90 print:hidden"
    >
      Imprimir / PDF
    </button>
  );
}

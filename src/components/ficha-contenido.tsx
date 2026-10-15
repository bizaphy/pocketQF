// Información de una ficha de Pocket QF para consultar en el mesón:
// diagnóstico o uso típico, efectos secundarios y precauciones.

import type { Ficha } from "@/db/schema";

const SECCIONES = [
  { campo: "indicaciones", titulo: "Diagnóstico o uso típico" },
  { campo: "efectosSecundarios", titulo: "Efectos secundarios frecuentes" },
  { campo: "observaciones", titulo: "Precauciones y consejos" },
] as const;

export default function FichaContenido({
  ficha,
}: {
  ficha: Pick<Ficha, "indicaciones" | "efectosSecundarios" | "observaciones">;
}) {
  const conTexto = SECCIONES.filter((s) => ficha[s.campo]);
  if (conTexto.length === 0) {
    return (
      <p className="text-sm text-steel">Esta ficha aún no tiene información.</p>
    );
  }

  return (
    <dl className="grid gap-3">
      {conTexto.map((s) => (
        <div key={s.campo}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-lavender">
            {s.titulo}
          </dt>
          {/* whitespace-pre-line: respeta los saltos de línea que se escribieron */}
          <dd className="mt-0.5 whitespace-pre-line text-sm">
            {ficha[s.campo]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

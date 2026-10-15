// Contador de vencimientos: un botón por plazo con su cantidad de lotes y, abajo,
// el resumen del plazo elegido con las categorías más afectadas.
// Los datos llegan ya calculados desde el servidor; aquí solo se elige qué plazo mirar.

"use client";

import { useState } from "react";
import type { ClavePlazo, ResumenPlazo } from "@/lib/resumen-vencimientos";

const MAX_CATEGORIAS = 5;

// mismo semáforo que las etiquetas de la tabla (urgencia.ts), escrito completo para Tailwind
const COLOR: Record<ClavePlazo, { numero: string; barra: string }> = {
  vencidos: { numero: "text-strawberry", barra: "bg-strawberry" },
  "1m": { numero: "text-strawberry", barra: "bg-strawberry/60" },
  "3m": { numero: "text-deep-space", barra: "bg-saffron" },
  "6m": { numero: "text-steel", barra: "bg-steel/50" },
  "12m": { numero: "text-steel", barra: "bg-steel/30" },
};

export default function ContadorVencimientos({
  resumen,
}: {
  resumen: ResumenPlazo[];
}) {
  const [clave, setClave] = useState<ClavePlazo>("1m");
  const elegido = resumen.find((r) => r.clave === clave)!;
  const visibles = elegido.categorias.slice(0, MAX_CATEGORIAS);
  const resto = elegido.categorias.length - visibles.length;
  const maximo = visibles[0]?.lotes ?? 1; // la barra más larga es la primera

  return (
    <section className="mb-6 rounded-xl border border-frosted bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Próximos a vencer</h2>
      <p className="mt-1 text-sm text-steel">
        Lotes que vencen dentro de cada plazo, contando desde hoy.
      </p>

      <div
        role="tablist"
        aria-label="Plazo"
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        {resumen.map((r) => {
          const activo = r.clave === clave;
          return (
            <button
              key={r.clave}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setClave(r.clave)}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                activo
                  ? "border-deep-space bg-honeydew"
                  : "border-frosted hover:bg-honeydew/60"
              }`}
            >
              <span className="block text-xs text-steel">
                {r.clave === "vencidos"
                  ? r.etiqueta
                  : `Dentro de ${r.etiqueta}`}
              </span>
              <span
                className={`block text-2xl font-bold tabular-nums ${COLOR[r.clave].numero}`}
              >
                {r.lotes}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-5">
        {elegido.lotes === 0 ? (
          <p className="text-sm text-steel">
            {clave === "vencidos"
              ? "No hay lotes vencidos."
              : `No hay lotes con vencimientos dentro de ${elegido.etiqueta}.`}
          </p>
        ) : (
          <>
            <p className="text-sm">
              <b className="tabular-nums">{elegido.lotes}</b>{" "}
              {elegido.lotes === 1 ? "lote" : "lotes"} ·{" "}
              <b className="tabular-nums">{elegido.unidades}</b>{" "}
              {elegido.unidades === 1 ? "unidad" : "unidades"} en{" "}
              {elegido.categorias.length}{" "}
              {elegido.categorias.length === 1 ? "categoría" : "categorías"}
            </p>
            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-steel">
              Categorías más afectadas
            </h3>
            <ul className="grid gap-2">
              {visibles.map((c) => (
                <li
                  key={c.categoria}
                  className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_auto]"
                >
                  <span className="truncate" title={c.categoria}>
                    {c.categoria}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-frosted/30">
                    <span
                      className={`block h-full rounded-full ${COLOR[clave].barra}`}
                      style={{ width: `${(c.lotes / maximo) * 100}%` }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-right tabular-nums text-steel">
                    {c.lotes} {c.lotes === 1 ? "lote" : "lotes"} · {c.unidades}{" "}
                    u.
                  </span>
                </li>
              ))}
            </ul>
            {resto > 0 && (
              <p className="mt-2 text-xs text-steel">
                y {resto} {resto === 1 ? "categoría más" : "categorías más"}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

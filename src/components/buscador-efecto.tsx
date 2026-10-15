// Busca dentro del texto de las fichas: uso típico, efectos secundarios y precauciones.
// Ej: "dejar de fumar" → Anfebutamona, con los productos que hay de ella.

"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductoConsulta } from "@/components/consulta-pocket-qf";
import type { Ficha } from "@/db/schema";
import {
  CAMPOS_FICHA,
  buscarEnFichas,
  palabrasBusqueda,
  productosDeFicha,
  resaltar,
} from "@/lib/pocket-qf";

const MAX_PRODUCTOS = 5; // productos que se muestran por ficha (los con stock primero)

const EJEMPLOS = ["dejar de fumar", "insomnio", "náuseas", "embarazo"];

export default function BuscadorEfecto({
  fichas,
  productos,
}: {
  fichas: (Ficha & { productoIds: number[] })[];
  productos: ProductoConsulta[];
}) {
  const [texto, setTexto] = useState("");
  const palabras = palabrasBusqueda(texto);
  const resultados = buscarEnFichas(fichas, texto);

  return (
    <div className="grid gap-4">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ej: dejar de fumar, insomnio, somnolencia..."
        aria-label="Buscar por uso o efecto"
        className="input h-11 w-full min-w-0"
      />

      {palabras.length === 0 ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-steel">
          Prueba con:
          {EJEMPLOS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setTexto(e)}
              className="rounded-full border border-frosted px-2.5 py-0.5 text-xs font-medium hover:border-lavender hover:text-lavender"
            >
              {e}
            </button>
          ))}
        </p>
      ) : resultados.length === 0 ? (
        <p className="text-sm text-steel">
          Ninguna ficha menciona “{texto.trim()}”. Solo se busca en la
          información que el equipo escribió en las fichas.
        </p>
      ) : (
        <ul className="grid gap-3">
          {resultados.map(({ ficha, campos }) => {
            const { porNombre, aMano } = productosDeFicha(ficha, productos);
            // los con stock primero
            const suyos = [...porNombre, ...aMano].sort(
              (a, b) => Number(b.stock > 0) - Number(a.stock > 0),
            );
            const conStock = suyos.filter((p) => p.stock > 0).length;
            return (
              <li
                key={ficha.id}
                className="rounded-lg border border-lavender/30 bg-lavender/5 p-4"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/pocket-qf/${ficha.id}`}
                    className="font-semibold text-lavender underline-offset-4 hover:underline"
                  >
                    {ficha.principioActivo}
                  </Link>
                  <span className="text-xs text-steel">
                    {suyos.length === 1
                      ? "1 producto"
                      : `${suyos.length} productos`}{" "}
                    · {conStock} con stock
                  </span>
                </div>

                {/* solo los campos donde aparece lo buscado, con las palabras resaltadas */}
                <dl className="grid gap-2">
                  {campos.map((c) => (
                    <div key={c}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-steel">
                        {CAMPOS_FICHA[c]}
                      </dt>
                      <dd className="whitespace-pre-line text-sm">
                        {resaltar(ficha[c] ?? "", palabras).map((t, i) =>
                          t.marcado ? (
                            <mark
                              key={i}
                              className="rounded bg-saffron/40 px-0.5 text-deep-space"
                            >
                              {t.texto}
                            </mark>
                          ) : (
                            t.texto
                          ),
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {suyos.length > 0 && (
                  <ul className="mt-3 grid gap-1 border-t border-lavender/20 pt-2 text-xs">
                    {suyos.slice(0, MAX_PRODUCTOS).map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span className="min-w-0">{p.nombre}</span>
                        <span
                          className={`shrink-0 tabular-nums ${p.stock > 0 ? "text-deep-space" : "text-strawberry"}`}
                        >
                          {p.stock > 0 ? `${p.stock} en stock` : "Sin stock"}
                        </span>
                      </li>
                    ))}
                    {suyos.length > MAX_PRODUCTOS && (
                      <li>
                        <Link
                          href={`/pocket-qf/${ficha.id}`}
                          className="text-steel underline underline-offset-2"
                        >
                          Ver los {suyos.length} productos
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

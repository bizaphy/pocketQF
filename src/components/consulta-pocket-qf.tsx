// Consulta rápida de Pocket QF: busca un producto (por nombre o código de barra) o un principio activo
// y muestra las fichas del producto elegido.

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FichaContenido from "@/components/ficha-contenido";
import type { Ficha } from "@/db/schema";
import { normalizar } from "@/lib/mapa";
import { fichasDeProducto, terminosDeFicha } from "@/lib/pocket-qf";

export type ProductoConsulta = {
  id: number;
  sku: string;
  nombre: string;
  stock: number;
  categoria: string | null;
};

type FichaConsulta = Ficha & { productoIds: number[] };

const MAX_RESULTADOS = 50;

export default function ConsultaPocketQF({
  productos,
  fichas,
}: {
  productos: ProductoConsulta[];
  fichas: FichaConsulta[];
}) {
  const [texto, setTexto] = useState("");
  const [elegido, setElegido] = useState<ProductoConsulta | null>(null);

  // nombres normalizados una sola vez: son miles de productos
  const normalizados = useMemo(
    () => productos.map((p) => ({ p, nombre: normalizar(p.nombre) })),
    [productos],
  );

  const busqueda = normalizar(texto);
  const buscando = busqueda.length >= 2;

  const fichasEncontradas = buscando
    ? fichas.filter((f) => terminosDeFicha(f).some((t) => t.includes(busqueda)))
    : [];
  const coincidencias = buscando
    ? normalizados
        .filter(
          ({ p, nombre }) =>
            nombre.includes(busqueda) || p.sku.includes(busqueda),
        )
        .map(({ p }) => p)
    : [];
  const resultados = coincidencias.slice(0, MAX_RESULTADOS);

  const fichasElegido = elegido ? fichasDeProducto(elegido, fichas) : [];

  return (
    <div className="grid gap-4">
      <input
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setElegido(null);
        }}
        placeholder="Busca un producto, código de barra o principio activo..."
        aria-label="Buscar"
        autoFocus
        className="input h-12 w-full min-w-0 text-base"
      />

      {elegido ? (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold">{elegido.nombre}</p>
              <p className="text-xs text-steel">
                <span className="font-mono">{elegido.sku}</span>
                {elegido.categoria && ` · ${elegido.categoria}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setElegido(null)}
              className="text-sm font-medium text-steel underline underline-offset-2 hover:text-deep-space"
            >
              ← Volver a los resultados
            </button>
          </div>

          {fichasElegido.length === 0 ? (
            <p className="rounded-lg border border-dashed border-frosted p-4 text-sm text-steel">
              Este producto no tiene ficha. Crea la ficha de su principio activo
              con el formulario de esta página; si su nombre no trae el
              principio activo, asócialo a mano desde la ficha.
            </p>
          ) : (
            fichasElegido.map((f) => (
              <article
                key={f.id}
                className="rounded-lg border border-lavender/30 bg-lavender/5 p-4"
              >
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-lavender">
                    {f.principioActivo}
                  </h3>
                  <Link
                    href={`/pocket-qf/${f.id}`}
                    className="text-xs font-medium text-steel underline underline-offset-2 hover:text-deep-space"
                  >
                    Editar ficha
                  </Link>
                </div>
                <FichaContenido ficha={f} />
              </article>
            ))
          )}
        </div>
      ) : (
        buscando && (
          <div className="grid gap-4">
            {fichasEncontradas.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel">
                  Fichas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fichasEncontradas.map((f) => (
                    <Link
                      key={f.id}
                      href={`/pocket-qf/${f.id}`}
                      className="rounded-full bg-lavender/15 px-3 py-1 text-sm font-medium text-lavender hover:bg-lavender/25"
                    >
                      {f.principioActivo}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel">
                Productos ·{" "}
                {coincidencias.length > MAX_RESULTADOS
                  ? `${coincidencias.length} (se muestran ${MAX_RESULTADOS}, escribe más para afinar)`
                  : coincidencias.length}
              </h3>
              {resultados.length === 0 ? (
                <p className="text-sm text-steel">Sin resultados</p>
              ) : (
                <ul className="max-h-96 divide-y divide-frosted/40 overflow-y-auto overscroll-contain rounded-lg border border-frosted">
                  {resultados.map((p) => {
                    const suyas = fichasDeProducto(p, fichas);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setElegido(p)}
                          className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-left text-sm hover:bg-honeydew"
                        >
                          <span className="min-w-0 flex-1 basis-60">
                            {p.nombre}
                            <span className="block font-mono text-xs text-steel">
                              {p.sku}
                            </span>
                          </span>
                          {suyas.length === 0 ? (
                            <span className="text-xs text-steel/70">
                              Sin ficha
                            </span>
                          ) : (
                            suyas.map((f) => (
                              <span
                                key={f.id}
                                className="rounded-full bg-lavender/15 px-2 py-0.5 text-xs font-semibold text-lavender"
                              >
                                {f.principioActivo}
                              </span>
                            ))
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

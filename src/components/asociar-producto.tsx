// Busca un producto y lo asocia a mano a una ficha (para marcas cuyo nombre no trae el principio activo).
// Los que ya están asociados (por nombre o a mano) no aparecen en los resultados.

"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { vincularProductoAccion } from "@/actions/pocket-qf";
import type { ProductoConsulta } from "@/components/consulta-pocket-qf";
import { normalizar } from "@/lib/mapa";

const MAX_RESULTADOS = 30;

export default function AsociarProducto({
  fichaId,
  productos,
  yaAsociados,
}: {
  fichaId: number;
  productos: ProductoConsulta[];
  yaAsociados: number[];
}) {
  const [texto, setTexto] = useState("");
  const [pendiente, iniciar] = useTransition();

  const normalizados = useMemo(
    () => productos.map((p) => ({ p, nombre: normalizar(p.nombre) })),
    [productos],
  );

  const busqueda = normalizar(texto);
  const resultados =
    busqueda.length < 2
      ? []
      : normalizados
          .filter(
            ({ p, nombre }) =>
              !yaAsociados.includes(p.id) &&
              (nombre.includes(busqueda) || p.sku.includes(busqueda)),
          )
          .slice(0, MAX_RESULTADOS)
          .map(({ p }) => p);

  function asociar(productoId: number) {
    iniciar(async () => {
      const r = await vincularProductoAccion(fichaId, productoId);
      if (r.ok) toast.success(r.mensaje);
      else toast.error(r.mensaje);
    });
  }

  return (
    <div className="grid gap-2">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ej: Kitadol o código de barra"
        aria-label="Buscar producto para asociar"
        className="input h-10 w-full min-w-0 text-sm"
      />
      {busqueda.length >= 2 &&
        (resultados.length === 0 ? (
          <p className="text-xs text-steel">Sin resultados</p>
        ) : (
          <ul className="max-h-64 divide-y divide-frosted/40 overflow-y-auto overscroll-contain rounded-lg border border-frosted">
            {resultados.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="min-w-0">
                  {p.nombre}
                  <span className="block font-mono text-xs text-steel">
                    {p.sku}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => asociar(p.id)}
                  className="shrink-0 rounded-lg bg-lavender px-2.5 py-1 text-xs font-semibold text-white hover:bg-lavender/90 disabled:opacity-50"
                >
                  Asociar
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

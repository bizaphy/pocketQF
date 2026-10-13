// Buscador de producto: filtra por código de barra o nombre y envía el id del elegido en el formulario
"use client";

import { useState } from "react";

export type ProductoOpcion = {
  id: number;
  sku: string; // código de barra
  nombre: string;
  stock: number;
  categoria: string | null;
};

// "12 en stock · Vitaminas": ayuda a distinguir productos de nombre parecido
function detalle(p: ProductoOpcion) {
  return [`${p.stock} en stock`, p.categoria].filter(Boolean).join(" · ");
}

const MAX_RESULTADOS = 200;

export default function BuscadorProducto({
  productos,
  error,
}: {
  productos: ProductoOpcion[];
  error?: string;
}) {
  const [texto, setTexto] = useState("");
  const [elegido, setElegido] = useState<ProductoOpcion | null>(null);

  const busqueda = texto.trim().toLowerCase();
  const coincidencias =
    busqueda.length < 2
      ? []
      : productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.sku.toLowerCase().includes(busqueda),
        );
  // se dibujan como máximo MAX_RESULTADOS: con 2 letras pueden coincidir miles de productos
  const resultados = coincidencias.slice(0, MAX_RESULTADOS);

  return (
    <div className="grid gap-1 text-sm font-medium">
      Producto
      {/* lo que se envía: el id, no el texto */}
      <input type="hidden" name="productoId" value={elegido?.id ?? ""} />
      {elegido ? (
        <div className="flex items-center justify-between rounded-lg border border-frosted px-3 py-2">
          <span>
            <span className="font-mono text-steel">{elegido.sku}</span>{" "}
            {elegido.nombre}
            <span className="block text-xs font-normal text-steel">
              {detalle(elegido)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setElegido(null)}
            className="text-xs underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe el código de barra o el nombre"
            className="input"
          />
          {busqueda.length >= 2 && (
            <p className="text-xs font-normal text-steel">
              {coincidencias.length === 0
                ? "Sin resultados"
                : coincidencias.length > MAX_RESULTADOS
                  ? `${coincidencias.length} resultados; se muestran los primeros ${MAX_RESULTADOS}. Escribe más para afinar.`
                  : `${coincidencias.length} resultado${coincidencias.length === 1 ? "" : "s"}`}
            </p>
          )}
          {resultados.length > 0 && (
            // max-h + overflow-y-auto: la lista tiene alto fijo y hace scroll por dentro
            <ul className="max-h-80 divide-y divide-frosted/40 overflow-y-auto overscroll-contain rounded-lg border border-frosted bg-white">
              {resultados.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setElegido(p)}
                    className="w-full px-3 py-2 text-left hover:bg-honeydew"
                  >
                    <span className="font-mono text-steel">{p.sku}</span>{" "}
                    {p.nombre}
                    <span className="block text-xs font-normal text-steel">
                      {detalle(p)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {error && <span className="text-xs text-strawberry">{error}</span>}
    </div>
  );
}

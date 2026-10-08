// Buscador de producto: filtra por SKU o nombre y envía el id del elegido en el formulario

// es componente de cliente porque usa estado (useState) y eventos (onChange, onClick),
// que solo existen en el navegador
"use client";

import { useState } from "react";

export type ProductoOpcion = { id: number; sku: string; nombre: string };

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
  const resultados =
    busqueda.length < 2
      ? []
      : productos
          .filter(
            (p) =>
              p.nombre.toLowerCase().includes(busqueda) ||
              p.sku.toLowerCase().includes(busqueda),
          )
          .slice(0, 8); // como máximo 8 sugerencias

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
            placeholder="Escribe el SKU o el nombre"
            className="input"
          />
          {resultados.length > 0 && (
            <ul className="rounded-lg border border-frosted bg-white">
              {resultados.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setElegido(p)}
                    className="w-full px-3 py-2 text-left hover:bg-honeydew"
                  >
                    <span className="font-mono text-steel">{p.sku}</span>{" "}
                    {p.nombre}
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

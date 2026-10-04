import { productosPlaceHolder } from "@/data/productos";
import {
  diasRestantes,
  formatearFecha,
  formatearFechaHora,
} from "@/lib/fechas";
import { estiloUrgencia, textoDias } from "@/lib/urgencia";
import type { Metadata } from "next";
//
export const metadata: Metadata = { title: "Vencimientos" };
// PREPARADOR DE DATOS

const productos = [...productosPlaceHolder].sort(
  (a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento), //ej. "2026-10-02" < "2026-10-04" < "2026-10-15" debe hacerse con el formato Y-M-D (ISO), no con el CL
);

export default function VencimientosPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-steel">
          PocketQF
        </p>
        <h1 className="mt-1 text-3xl font-bold text-deep-space">
          Vencimientos
        </h1>
        <p className="mt-1 text-steel">
          Productos ordenados por fecha de vencimiento, del más próximo al más
          lejano.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
            <tr>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Vence</th>
              <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Última revisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-frosted/60">
            {productos.map((producto) => {
              const dias = diasRestantes(producto.fechaVencimiento);
              return (
                <tr
                  key={producto.sku}
                  className="transition-colors hover:bg-honeydew"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-steel">
                    {producto.sku}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {producto.nombre}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatearFecha(producto.fechaVencimiento)}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${estiloUrgencia(dias)}`}
                    >
                      {textoDias(dias)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {producto.cantidad}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-steel">
                    {formatearFechaHora(producto.ultimaRevision)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

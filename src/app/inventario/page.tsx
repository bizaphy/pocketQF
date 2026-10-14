import Link from "next/link";
import type { Metadata } from "next";
import FormularioInventario from "@/components/formulario-inventario";
import EncabezadoModulo from "@/components/encabezado-modulo";
import { obtenerModulo } from "@/lib/modulos";
import { formatearDiaFechaHora } from "@/lib/fechas";
import { obtenerCategorias, obtenerInventarios } from "@/lib/inventario";

export const metadata: Metadata = { title: "Inventario" };

export default async function InventarioPage() {
  const [categorias, inventarios] = await Promise.all([
    obtenerCategorias(),
    obtenerInventarios(),
  ]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/inventario")}
        titulo="Inventario"
        descripcion="Genera una lista de productos para contar hoy, a partir de la base de productos del Excel."
      />

      <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Generar inventario del día</h2>
        {categorias.length === 0 ? (
          <p className="text-sm text-steel">
            No hay productos cargados.{" "}
            <Link href="/productos" className="underline">
              Sube el Excel de productos
            </Link>{" "}
            para generar un inventario.
          </p>
        ) : (
          <FormularioInventario categorias={categorias} />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Inventarios anteriores</h2>
        {inventarios.length === 0 ? (
          <p className="text-sm text-steel">Todavía no hay inventarios.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Productos</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Contados
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Diferencias
                  </th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-frosted/60">
                {inventarios.map((inv) => (
                  <tr key={inv.id} className="hover:bg-honeydew">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/inventario/${inv.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {formatearDiaFechaHora(inv.creadoEn)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-steel">
                      {inv.modo === "categoria" ? inv.categoria : "Al azar"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {inv.contados}/{inv.total}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {inv.diferencias > 0 ? (
                        <span className="font-semibold text-strawberry">
                          {inv.diferencias}
                        </span>
                      ) : (
                        inv.diferencias
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.finalizadoEn ? (
                        <span className="rounded-full bg-frosted/40 px-2 py-0.5 text-xs font-semibold">
                          Finalizado
                        </span>
                      ) : (
                        <span className="rounded-full bg-saffron/25 px-2 py-0.5 text-xs font-semibold">
                          En curso
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

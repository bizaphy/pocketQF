import {
  diasRestantes,
  formatearFecha,
  formatearFechaHora,
} from "@/lib/fechas";
import { estiloUrgencia, textoDias } from "@/lib/urgencia";
import { obtenerVencimientos } from "@/lib/consultas";
import type { Metadata } from "next";
import Link from "next/link";
import BotonEditarVencimiento from "@/components/boton-editar-vencimiento";
import BotonEliminarVencimiento from "@/components/boton-eliminar-vencimiento";
import Interruptor from "@/components/interruptor";
import EncabezadoModulo from "@/components/encabezado-modulo";
import { obtenerModulo } from "@/lib/modulos";
import ContadorVencimientos from "@/components/contador-vencimientos";
import { resumirVencimientos } from "@/lib/resumen-vencimientos";
//
export const metadata: Metadata = { title: "Vencimientos" };

export default async function VencimientosPage({
  searchParams,
}: PageProps<"/vencimientos">) {
  // vista compacta (por defecto): nombres en 2 líneas como máximo; ?vista=extendida los muestra completos
  const extendida = (await searchParams).vista === "extendida";

  // async: espera la consulta. Ya vienen ordenados por fecha (orderBy en la consulta)
  const vencimientos = await obtenerVencimientos();
  const resumen = resumirVencimientos(vencimientos, new Date());

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/vencimientos")}
        titulo="Vencimientos"
        descripcion="Productos ordenados por fecha de vencimiento, del más próximo al más lejano."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vencimientos/reporte"
            className="rounded-lg border border-deep-space px-4 py-2 text-sm font-semibold text-deep-space hover:bg-deep-space/5"
          >
            Reporte por mes
          </Link>
          <Link
            href="/vencimientos/nuevo"
            className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew hover:bg-deep-space/90"
          >
            + Agregar vencimiento
          </Link>
        </div>
      </EncabezadoModulo>

      <ContadorVencimientos resumen={resumen} />

      <div className="mb-3 flex justify-end">
        <Interruptor
          activo={extendida}
          href={extendida ? "/vencimientos" : "/vencimientos?vista=extendida"}
        >
          Nombres completos
        </Interruptor>
      </div>

      <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
            <tr>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Lote</th>
              <th className="px-4 py-3 font-semibold">Vence</th>
              <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Última revisión</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-frosted/60">
            {vencimientos.map((v) => {
              const dias = diasRestantes(v.fechaVencimiento);
              return (
                // key={v.id}: el sku se repite cuando un producto tiene varios lotes
                <tr key={v.id} className="transition-colors hover:bg-honeydew">
                  <td
                    className={`px-4 py-3 ${extendida ? "min-w-64" : "min-w-48"}`}
                  >
                    {/* compacta: 1 línea con ancho fijo, cortada con "…" (completo al pasar el mouse). Extendida: completo */}
                    <p
                      title={extendida ? undefined : v.nombre}
                      className={`font-medium leading-snug ${extendida ? "" : "max-w-48 truncate sm:max-w-64"}`}
                    >
                      {v.nombre}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-steel">
                      {v.sku}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono">
                    {v.lote}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatearFecha(v.fechaVencimiento)}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${estiloUrgencia(dias)}`}
                    >
                      {textoDias(dias)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {v.cantidad}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-steel">
                    {formatearFechaHora(v.ultimaRevision)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1 text-right">
                    <BotonEditarVencimiento vencimiento={v} />
                    <BotonEliminarVencimiento
                      id={v.id}
                      nombre={v.nombre}
                      lote={v.lote}
                    />
                  </td>
                </tr>
              );
            })}
            {vencimientos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-steel">
                  No hay vencimientos registrados.{" "}
                  <Link href="/vencimientos/nuevo" className="underline">
                    Agrega el primero
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

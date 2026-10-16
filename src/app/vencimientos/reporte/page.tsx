import type { Metadata } from "next";
import Link from "next/link";
import BotonImprimir from "@/components/boton-imprimir";
import GraficoVencimientosMes from "@/components/grafico-vencimientos-mes";
import { obtenerVencimientos } from "@/lib/consultas";
import { formatearFechaHora } from "@/lib/fechas";
import { reportarPorMes } from "@/lib/reporte-vencimientos";

export const metadata: Metadata = { title: "Reporte de vencimientos" };

export default async function ReporteVencimientosPage() {
  const hoy = new Date();
  const { meses, mayorRiesgo, vencidos } = reportarPorMes(
    await obtenerVencimientos(),
    hoy,
  );
  const riesgo = mayorRiesgo === null ? null : meses[mayorRiesgo];
  const totalLotes = meses.reduce((s, m) => s + m.lotes, 0);
  const totalUnidades = meses.reduce((s, m) => s + m.unidades, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link
        href="/vencimientos"
        className="text-sm text-steel hover:underline print:hidden"
      >
        ← Volver a vencimientos
      </Link>
      <header className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-deep-space">
            Reporte de vencimientos
          </h1>
          <p className="mt-1 text-steel">
            Próximos 12 meses ({meses[0].etiqueta} a {meses[11].etiqueta}) ·
            generado el {formatearFechaHora(hoy)}
          </p>
        </div>
        <BotonImprimir />
      </header>

      {/* resumen arriba: el mes de mayor riesgo es lo primero que se lee */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-frosted border-l-strawberry bg-white p-5 shadow-sm sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel">
            ⚠ Mes de mayor riesgo
          </p>
          {riesgo ? (
            <>
              <p className="mt-1 text-2xl font-bold capitalize">
                {riesgo.etiqueta}
              </p>
              <p className="text-sm text-steel">
                <b className="text-deep-space tabular-nums">
                  {riesgo.unidades}
                </b>{" "}
                unidades en {riesgo.lotes}{" "}
                {riesgo.lotes === 1 ? "lote" : "lotes"} ({riesgo.productos}{" "}
                {riesgo.productos === 1 ? "producto" : "productos"})
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-steel">
              No vence nada en los próximos 12 meses.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel">
            Lotes por vencer
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{totalLotes}</p>
          <p className="text-sm text-steel">en los 12 meses</p>
        </div>
        <div className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-steel">
            Unidades por vencer
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {totalUnidades}
          </p>
          <p className="text-sm text-steel">
            {vencidos > 0
              ? `sin contar ${vencidos} ${vencidos === 1 ? "lote ya vencido" : "lotes ya vencidos"}`
              : "en los 12 meses"}
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-frosted bg-white p-5 shadow-sm break-inside-avoid">
        <h2 className="mb-10 font-semibold">Vencimientos por mes</h2>
        <GraficoVencimientosMes meses={meses} mayorRiesgo={mayorRiesgo} />
      </section>

      {/* la misma información en tabla, para leer los números exactos */}
      <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm break-inside-avoid">
        <table className="w-full text-left text-sm">
          <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
            <tr>
              <th className="px-4 py-3 font-semibold">Mes</th>
              <th className="px-4 py-3 text-right font-semibold">Lotes</th>
              <th className="px-4 py-3 text-right font-semibold">Unidades</th>
              <th className="px-4 py-3 text-right font-semibold">Productos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-frosted/60">
            {meses.map((m, i) => (
              <tr
                key={m.clave}
                className={i === mayorRiesgo ? "bg-strawberry/8 font-semibold" : ""}
              >
                <td className="px-4 py-2 capitalize">
                  {m.etiqueta}
                  {i === mayorRiesgo && (
                    <span className="ml-2 rounded-full bg-strawberry px-2 py-0.5 text-xs font-semibold normal-case text-white">
                      Mayor riesgo
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{m.lotes}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {m.unidades}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {m.productos}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-frosted font-semibold">
            <tr>
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2 text-right tabular-nums">{totalLotes}</td>
              <td className="px-4 py-2 text-right tabular-nums">
                {totalUnidades}
              </td>
              <td className="px-4 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </main>
  );
}

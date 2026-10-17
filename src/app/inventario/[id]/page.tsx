import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FormularioConteo from "@/components/formulario-conteo";
import IconoCandado from "@/components/icono-candado";
import { formatearDiaFechaHora } from "@/lib/fechas";
import { obtenerInventario } from "@/lib/inventario";

export const metadata: Metadata = { title: "Inventario" };

export default async function InventarioDetallePage({
  params,
  searchParams,
}: PageProps<"/inventario/[id]">) {
  const { id } = await params;
  const inventario = await obtenerInventario(Number(id));
  if (!inventario) notFound();

  // los deja la acción al generar el inventario, para mostrar el aviso una vez
  const { generado, recientes } = await searchParams;

  const contados = inventario.items.filter((it) => it.contado !== null);
  const conDiferencia = contados.filter((it) => it.contado !== it.stockSistema);

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <Link href="/inventario" className="text-sm text-steel hover:underline">
        ← Volver a inventario
      </Link>
      <header className="mb-6 mt-2">
        {inventario.modo === "controlados" && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-strawberry px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <IconoCandado className="size-3.5" />
            Controlados · uso restringido
          </span>
        )}
        <h1 className="text-3xl font-bold text-deep-space">
          Inventario{" "}
          {inventario.modo === "controlados"
            ? "de controlados"
            : inventario.modo === "categoria"
              ? inventario.categoria
              : "al azar"}
        </h1>
        <p className="mt-1 text-steel">
          {formatearDiaFechaHora(inventario.creadoEn)} ·{" "}
          {inventario.items.length} productos ·{" "}
          {inventario.finalizadoEn
            ? `finalizado ${formatearDiaFechaHora(inventario.finalizadoEn)}`
            : `${contados.length} contados`}
        </p>
      </header>

      {generado && !inventario.finalizadoEn && (
        <p className="mb-4 rounded-lg bg-honeydew px-4 py-3 text-sm">
          {inventario.modo === "controlados"
            ? `Se agregaron los ${generado} productos controlados.`
            : `Se eligieron ${generado} productos al azar.`}
          {Number(recientes) > 0 &&
            ` Se omitieron ${recientes} porque se contaron hace poco.`}
        </p>
      )}

      {inventario.finalizadoEn ? (
        <>
          <p className="mb-4 text-sm">
            {conDiferencia.length === 0 ? (
              "Sin diferencias: todo lo contado coincide con el sistema."
            ) : (
              <span className="font-semibold text-strawberry">
                {conDiferencia.length} producto
                {conDiferencia.length === 1 ? "" : "s"} con diferencias
              </span>
            )}
          </p>
          <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Sistema
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Contado
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-frosted/60">
                {inventario.items.map((it) => {
                  const dif =
                    it.contado === null ? null : it.contado - it.stockSistema;
                  return (
                    <tr key={it.id} className="hover:bg-honeydew">
                      <td className="min-w-48 px-4 py-3">
                        <p className="font-medium leading-snug">{it.nombre}</p>
                        <p className="mt-0.5 font-mono text-xs text-steel">
                          {it.sku}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {it.stockSistema}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {it.contado ?? (
                          <span className="text-steel">Sin contar</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {dif === null ? (
                          "—"
                        ) : dif === 0 ? (
                          <span className="text-steel">0</span>
                        ) : (
                          // faltan unidades: rojo; sobran: amarillo
                          <span
                            className={`rounded-full px-2 py-0.5 ${dif < 0 ? "bg-strawberry/15 text-strawberry" : "bg-saffron/25"}`}
                          >
                            {dif > 0 ? `+${dif}` : dif}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <FormularioConteo
          inventarioId={inventario.id}
          // sin stockSistema: el conteo es a ciegas
          items={inventario.items.map((it) => ({
            id: it.id,
            sku: it.sku,
            nombre: it.nombre,
            categoria: it.categoria,
            contado: it.contado,
          }))}
        />
      )}
    </main>
  );
}

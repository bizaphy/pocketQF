import Link from "next/link";
import type { Metadata } from "next";
import FormularioInventario from "@/components/formulario-inventario";
import FormularioControlados from "@/components/formulario-controlados";
import IconoCandado from "@/components/icono-candado";
import EncabezadoModulo from "@/components/encabezado-modulo";
import { obtenerModulo } from "@/lib/modulos";
import { formatearDiaFechaHora, formatearFecha } from "@/lib/fechas";
import {
  CATEGORIA_CONTROLADOS,
  contarControlados,
  obtenerCategorias,
  obtenerInventarios,
} from "@/lib/inventario";
import { claveDia, claveMes, leerMes } from "@/lib/calendario";
import CalendarioInventarios, {
  type InventarioDelDia,
} from "@/components/calendario-inventarios";

export const metadata: Metadata = { title: "Inventario" };

export default async function InventarioPage({
  searchParams,
}: PageProps<"/inventario">) {
  // ?mes=2026-10 elige el mes del calendario; ?dia=2026-10-14 filtra la tabla por ese día
  const params = await searchParams;
  const [todasLasCategorias, controlados, todos] = await Promise.all([
    obtenerCategorias(),
    contarControlados(),
    obtenerInventarios(),
  ]);
  // los controlados tienen su propio inventario: no se ofrecen en el del día
  const categorias = todasLasCategorias.filter(
    (c) => c.categoria !== CATEGORIA_CONTROLADOS,
  );

  const hoy = new Date();
  const mes = leerMes(
    typeof params.mes === "string" ? params.mes : undefined,
    hoy,
  );
  const dia = typeof params.dia === "string" ? params.dia : undefined;

  // agrupa los inventarios por día local para marcarlos en el calendario
  const porDia = new Map<string, InventarioDelDia[]>();
  for (const inv of todos) {
    const clave = claveDia(inv.creadoEn);
    const lista = porDia.get(clave) ?? [];
    lista.push({ id: inv.id, finalizado: inv.finalizadoEn !== null });
    porDia.set(clave, lista);
  }

  const inventarios = dia
    ? todos.filter((inv) => claveDia(inv.creadoEn) === dia)
    : todos;

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/inventario")}
        titulo="Inventario"
        descripcion="Genera una lista de productos para contar hoy, a partir de la base de productos del Excel."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
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

          {/* controlados: tarjeta aparte con acento rojo y candado, para que se note que es restringido */}
          {controlados.total > 0 && (
            <section className="rounded-xl border border-strawberry/40 border-l-4 border-l-strawberry bg-strawberry/5 p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-deep-space">
                  <span className="grid size-8 place-items-center rounded-full bg-strawberry text-white">
                    <IconoCandado />
                  </span>
                  Inventario de controlados
                </h2>
                <span className="rounded-full border border-strawberry/50 bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-strawberry">
                  Uso restringido
                </span>
              </div>
              <FormularioControlados
                total={controlados.total}
                conStock={controlados.conStock}
              />
            </section>
          )}
        </div>

        <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Calendario</h2>
          <CalendarioInventarios
            mes={mes}
            hoy={hoy}
            porDia={porDia}
            diaElegido={dia}
          />
        </section>
      </div>

      <section id="historial" className="mt-8 scroll-mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            Inventarios anteriores
            {dia && (
              <span className="font-normal text-steel">
                {" "}
                · {formatearFecha(dia)}
              </span>
            )}
          </h2>
          {dia && (
            <Link
              href={`/inventario?mes=${claveMes(mes)}`}
              className="text-sm font-medium text-deep-space underline underline-offset-2 hover:text-steel"
            >
              Ver todos
            </Link>
          )}
        </div>
        {inventarios.length === 0 ? (
          <p className="text-sm text-steel">
            {dia
              ? "No hay inventarios ese día."
              : "Todavía no hay inventarios."}
          </p>
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
                      {inv.modo === "controlados" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-strawberry/10 px-2 py-0.5 text-xs font-semibold text-strawberry">
                          <IconoCandado className="size-3.5" />
                          Controlados
                        </span>
                      ) : inv.modo === "categoria" ? (
                        inv.categoria
                      ) : (
                        "Al azar"
                      )}
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

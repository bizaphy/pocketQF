import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AsociarProducto from "@/components/asociar-producto";
import BotonConfirmar from "@/components/boton-confirmar";
import FormularioFicha from "@/components/formulario-ficha";
import { borrarFicha, desvincularProductoAccion } from "@/actions/pocket-qf";
import { obtenerProductosActivos } from "@/lib/consultas";
import { obtenerFicha } from "@/lib/fichas";
import { formatearDiaFechaHora } from "@/lib/fechas";
import { productosDeFicha } from "@/lib/pocket-qf";

export const metadata: Metadata = { title: "Ficha" };

export default async function FichaPage({
  params,
}: PageProps<"/pocket-qf/[id]">) {
  const { id } = await params;
  const ficha = await obtenerFicha(Number(id));
  if (!ficha) notFound();

  const productos = await obtenerProductosActivos();
  const { porNombre, aMano } = productosDeFicha(ficha, productos);
  const total = porNombre.length + aMano.length;

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <Link href="/pocket-qf" className="text-sm text-steel hover:underline">
        ← Volver a Pocket QF
      </Link>

      <header className="mb-6 mt-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-steel">
          <span className="size-2 rounded-full bg-lavender" />
          Ficha · {total === 1 ? "1 producto" : `${total} productos`}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-deep-space">
          {ficha.principioActivo}
        </h1>
        <p className="mt-1 text-sm text-steel">
          Actualizada el {formatearDiaFechaHora(ficha.actualizadaEn)}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0 rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Información</h2>
          {/* key: si cambian los datos guardados, el formulario muestra los nuevos */}
          <FormularioFicha key={ficha.actualizadaEn.getTime()} ficha={ficha} />
          <p className="mt-4 text-xs text-steel">
            Información escrita por el equipo para consulta rápida; no reemplaza
            el folleto del producto ni la indicación médica.
          </p>
        </section>

        <section className="grid min-w-0 gap-5 rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold">Asociados por nombre</h2>
            <p className="mb-2 text-xs text-steel">
              Productos cuyo nombre contiene el principio activo u otro de sus
              nombres.
            </p>
            {porNombre.length === 0 ? (
              <p className="text-sm text-steel">Ninguno.</p>
            ) : (
              <ul className="max-h-64 divide-y divide-frosted/40 overflow-y-auto overscroll-contain text-sm">
                {porNombre.map((p) => (
                  <li key={p.id} className="py-1.5">
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-semibold">Asociados a mano</h2>
            <p className="mb-2 text-xs text-steel">
              Marcas cuyo nombre no trae el principio activo.
            </p>
            {aMano.length > 0 && (
              <ul className="mb-3 divide-y divide-frosted/40 text-sm">
                {aMano.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 py-1"
                  >
                    <span className="min-w-0">{p.nombre}</span>
                    <BotonConfirmar
                      texto="Quitar"
                      soloIcono
                      titulo="¿Quitar producto?"
                      descripcion={
                        <>
                          <strong>{p.nombre}</strong> dejará de mostrar la ficha
                          de {ficha.principioActivo}.
                        </>
                      }
                      accion={desvincularProductoAccion.bind(
                        null,
                        ficha.id,
                        p.id,
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
            <AsociarProducto
              fichaId={ficha.id}
              productos={productos}
              yaAsociados={[...porNombre, ...aMano].map((p) => p.id)}
            />
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <BotonConfirmar
          texto="Eliminar ficha"
          titulo={`¿Eliminar la ficha de ${ficha.principioActivo}?`}
          descripcion="Se borrará su información y los productos asociados a mano. Esta acción no se puede deshacer."
          accion={borrarFicha.bind(null, ficha.id)}
          irA="/pocket-qf"
        />
      </div>
    </main>
  );
}

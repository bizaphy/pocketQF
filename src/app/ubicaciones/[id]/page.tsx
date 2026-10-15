import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BotonConfirmar from "@/components/boton-confirmar";
import EditorRepisas from "@/components/editor-repisas";
import FormularioEstante from "@/components/formulario-estante";
import { borrarEstante } from "@/actions/ubicaciones";
import { obtenerCategorias } from "@/lib/inventario";
import { COLUMNAS, FILAS, TIPOS, etiquetaUbicacion } from "@/lib/mapa";
import { obtenerEstante, obtenerMapa } from "@/lib/ubicaciones";

export const metadata: Metadata = { title: "Ubicación" };

const CELDA = 10; // el mapa chico usa celdas de 10 unidades

export default async function EstantePage({
  params,
}: PageProps<"/ubicaciones/[id]">) {
  const { id } = await params;
  const estante = await obtenerEstante(Number(id));
  if (!estante) notFound();

  const [muebles, categorias] = await Promise.all([
    obtenerMapa(estante.zonaId),
    obtenerCategorias(),
  ]);
  const etiqueta = etiquetaUbicacion(estante.zona.nombre, estante);
  const volver = `/ubicaciones?zona=${estante.zonaId}`;

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <Link href={volver} className="text-sm text-steel hover:underline">
        ← Volver al mapa
      </Link>

      <header className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-steel">
            <span className="size-2 rounded-full bg-moss" />
            {TIPOS[estante.tipo]} · {estante.repisas.length}{" "}
            {estante.repisas.length === 1 ? "repisa" : "repisas"}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-deep-space">
            {etiqueta}
          </h1>
        </div>

        {/* ubicación del mueble dentro de su zona */}
        <svg
          viewBox={`0 0 ${COLUMNAS * CELDA} ${FILAS * CELDA}`}
          className="w-48 rounded-lg border border-frosted bg-white"
          role="img"
          aria-label={`Ubicación de ${estante.nombre} en ${estante.zona.nombre}`}
        >
          {muebles.map((m) => (
            <rect
              key={m.id}
              x={m.x * CELDA + 1}
              y={m.y * CELDA + 1}
              width={m.ancho * CELDA - 2}
              height={m.alto * CELDA - 2}
              rx={2}
              className={m.id === estante.id ? "fill-moss" : "fill-frosted/50"}
            />
          ))}
        </svg>
      </header>

      <section>
        <h2 className="mb-3 font-semibold">Repisas</h2>
        <EditorRepisas
          estanteId={estante.id}
          etiqueta={etiqueta}
          repisas={estante.repisas}
          sugerencias={categorias.map((c) => c.categoria)}
        />
      </section>

      <section className="mt-8 rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Datos del mueble</h2>
        {/* key: si cambian los datos guardados, el formulario muestra los nuevos */}
        <FormularioEstante
          key={`${estante.nombre}|${estante.detalle}|${estante.tipo}`}
          estante={estante}
        />
      </section>

      <div className="mt-6 flex justify-end">
        <BotonConfirmar
          texto={`Eliminar ${TIPOS[estante.tipo].toLowerCase()}`}
          titulo={`¿Eliminar ${estante.nombre}?`}
          descripcion={
            <>
              Se quitará del mapa junto con sus <b>{estante.repisas.length}</b>{" "}
              repisas. Esta acción no se puede deshacer.
            </>
          }
          accion={borrarEstante.bind(null, estante.id)}
          irA={volver}
        />
      </div>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import BotonConfirmar from "@/components/boton-confirmar";
import EncabezadoModulo from "@/components/encabezado-modulo";
import FormularioZona from "@/components/formulario-zona";
import MapaUbicaciones from "@/components/mapa-ubicaciones";
import { borrarZona } from "@/actions/ubicaciones";
import { obtenerModulo } from "@/lib/modulos";
import { obtenerMapa, obtenerZonas } from "@/lib/ubicaciones";

export const metadata: Metadata = { title: "Ubicaciones" };

export default async function UbicacionesPage({
  searchParams,
}: PageProps<"/ubicaciones">) {
  // ?zona=3 elige la pestaña; ?editar=1 abre el mapa en modo edición (al crear una zona)
  const params = await searchParams;
  const zonas = await obtenerZonas();
  const zona = zonas.find((z) => String(z.id) === params.zona) ?? zonas[0];
  const muebles = zona ? await obtenerMapa(zona.id) : [];

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/ubicaciones")}
        titulo="Ubicaciones"
        descripcion="Mapa de la farmacia: toca un estante para ver qué hay en cada repisa."
      />

      {!zona ? (
        <section className="max-w-md rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Crea la primera zona</h2>
          <p className="mb-4 mt-1 text-sm text-steel">
            Cada zona (sala de ventas, bodega...) tiene su propio mapa donde
            ubicas estantes, vitrinas, refrigeradores y mesones.
          </p>
          <FormularioZona />
        </section>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-frosted">
            <nav className="-mb-px flex flex-wrap gap-1" aria-label="Zonas">
              {zonas.map((z) => (
                <Link
                  key={z.id}
                  href={`/ubicaciones?zona=${z.id}`}
                  aria-current={z.id === zona.id ? "page" : undefined}
                  className={`rounded-t-lg border px-4 py-2 text-sm font-semibold ${
                    z.id === zona.id
                      ? "border-frosted border-b-white bg-white text-deep-space"
                      : "border-transparent text-steel hover:text-deep-space"
                  }`}
                >
                  {z.nombre}
                </Link>
              ))}
            </nav>
            <details className="relative mb-2">
              <summary className="cursor-pointer list-none rounded-lg px-3 py-1.5 text-sm font-semibold text-moss hover:bg-moss/10">
                + Nueva zona
              </summary>
              <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-frosted bg-white p-3 shadow-lg">
                <FormularioZona placeholder="Ej: Bodega" />
              </div>
            </details>
          </div>

          {/* key: al cambiar de zona el mapa parte de cero con los muebles de esa zona */}
          <MapaUbicaciones
            key={zona.id}
            zona={{ id: zona.id, nombre: zona.nombre }}
            muebles={muebles}
            editarInicial={params.editar === "1"}
          />

          <div className="mt-6 flex justify-end">
            <BotonConfirmar
              texto="Eliminar zona"
              titulo={`¿Eliminar la zona "${zona.nombre}"?`}
              descripcion={
                <>
                  Se borrarán sus <b>{muebles.length}</b> muebles y todas sus
                  repisas. Esta acción no se puede deshacer.
                </>
              }
              accion={borrarZona.bind(null, zona.id)}
              irA="/ubicaciones"
            />
          </div>
        </>
      )}
    </main>
  );
}

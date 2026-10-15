import Link from "next/link";
import type { Metadata } from "next";
import EncabezadoModulo from "@/components/encabezado-modulo";
import ConsultaPocketQF from "@/components/consulta-pocket-qf";
import BuscadorEfecto from "@/components/buscador-efecto";
import FormularioFicha from "@/components/formulario-ficha";
import { obtenerModulo } from "@/lib/modulos";
import { obtenerProductosActivos } from "@/lib/consultas";
import { obtenerFichas } from "@/lib/fichas";
import { productosDeFicha } from "@/lib/pocket-qf";

export const metadata: Metadata = { title: "Pocket QF" };

export default async function PocketQFPage() {
  const [productos, fichas] = await Promise.all([
    obtenerProductosActivos(),
    obtenerFichas(),
  ]);

  const resumen = fichas.map((f) => {
    const { porNombre, aMano } = productosDeFicha(f, productos);
    return {
      ...f,
      productos: porNombre.length + aMano.length,
      incompleta: !f.indicaciones && !f.efectosSecundarios && !f.observaciones,
    };
  });

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/pocket-qf")}
        titulo="Pocket QF"
        descripcion="Busca un producto y consulta su uso típico, efectos secundarios y precauciones."
      />

      <section className="mb-8 rounded-xl border border-lavender/30 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Consulta rápida</h2>
        {productos.length === 0 ? (
          <p className="text-sm text-steel">
            No hay productos cargados.{" "}
            <Link href="/productos" className="underline">
              Sube el Excel de productos
            </Link>{" "}
            para poder buscarlos.
          </p>
        ) : (
          <ConsultaPocketQF productos={productos} fichas={fichas} />
        )}
      </section>

      <section className="mb-8 rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Buscar por uso o efecto</h2>
        <p className="mb-3 text-sm text-steel">
          Encuentra qué medicamento sirve para algo, o cuál puede causar un
          efecto, según lo escrito en las fichas.
        </p>
        {fichas.length === 0 ? (
          <p className="text-sm text-steel">
            Aún no hay fichas en las que buscar.
          </p>
        ) : (
          <BuscadorEfecto fichas={fichas} productos={productos} />
        )}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Fichas</h2>
            {fichas.length > 0 && (
              <span className="text-sm text-steel">
                {fichas.length === 1
                  ? "1 principio activo"
                  : `${fichas.length} principios activos`}
              </span>
            )}
          </div>
          {resumen.length === 0 ? (
            <p className="rounded-xl border border-dashed border-frosted bg-white p-5 text-sm text-steel">
              Todavía no hay fichas. Crea una por principio activo, solo para
              los medicamentos que necesiten aclaración: se asocia sola a todos
              los productos que lo traen en el nombre.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {resumen.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/pocket-qf/${f.id}`}
                    className="flex h-full flex-col rounded-xl border border-frosted bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{f.principioActivo}</span>
                      {f.incompleta && (
                        <span className="shrink-0 rounded-full bg-saffron/25 px-2 py-0.5 text-xs font-semibold">
                          Sin completar
                        </span>
                      )}
                    </span>
                    {f.indicaciones && (
                      <span className="mt-1 line-clamp-2 text-sm text-steel">
                        {f.indicaciones}
                      </span>
                    )}
                    <span className="mt-auto pt-2 text-xs text-steel">
                      {f.productos === 1
                        ? "1 producto"
                        : `${f.productos} productos`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Nueva ficha</h2>
          <FormularioFicha />
        </section>
      </div>
    </main>
  );
}

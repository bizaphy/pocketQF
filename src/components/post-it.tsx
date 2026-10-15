// Post-it del inicio: muestra en grande solo la nota del día (la más reciente escrita hoy),
// con su autor, fecha y hora exacta, y quién la editó. Al lado, el historial con las notas anteriores.
// Componente de servidor: "hoy" y las fechas se calculan con la hora del servidor

import { isToday } from "date-fns";
import FormularioNota from "@/components/formulario-nota";
import NotaDelDia from "@/components/nota-del-dia";
import { obtenerEdicionesNota, obtenerNotas } from "@/lib/consultas";
import { formatearDiaFechaHora } from "@/lib/fechas";

export default async function PostIt() {
  const notas = await obtenerNotas(); // la más reciente primero

  // la nota del día es la más reciente, pero solo si se escribió hoy
  const delDia = notas[0] && isToday(notas[0].creadaEn) ? notas[0] : null;
  const historial = delDia ? notas.slice(1) : notas;
  const ediciones = delDia ? await obtenerEdicionesNota(delDia.id) : [];

  return (
    <section className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <article className="relative mx-auto flex aspect-square max-h-[36rem] w-full max-w-xl flex-col rounded-sm bg-white text-deep-space shadow-[0_10px_30px_-12px_rgba(29,53,87,0.6)] -rotate-[0.6deg]">
        {/* cinta adhesiva arriba, al centro */}
        <span
          className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rotate-2 bg-frosted/60"
          aria-hidden
        />

        <header className="px-6 pt-7">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-steel">
            Nota del día
          </h2>
        </header>

        {/* la nota ocupa el centro del cuadro; si es larga, hace scroll.
            my-auto centra sin cortar el comienzo cuando no cabe (justify-center sí lo cortaría) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-4">
          <div className="my-auto">
            {delDia ? (
              <NotaDelDia
                key={`${delDia.id}-${delDia.ediciones}`} // al editarse, vuelve a mostrar la nota (sale del modo edición)
                nota={{
                  id: delDia.id,
                  contenido: delDia.contenido,
                  autor: delDia.autor,
                  fecha: formatearDiaFechaHora(delDia.creadaEn),
                  fechaISO: delDia.creadaEn.toISOString(),
                }}
                ediciones={ediciones.map((e) => ({
                  id: e.id,
                  editor: e.editor,
                  contenidoAnterior: e.contenidoAnterior,
                  fecha: formatearDiaFechaHora(e.editadaEn),
                }))}
              />
            ) : (
              <p className="text-center text-steel">
                Todavía no hay nota para hoy. Escríbela abajo.
              </p>
            )}
          </div>
        </div>

        <FormularioNota />
      </article>

      {/* panel claro: sobre el fondo intermedio del inicio el texto gris azulado no se lee directo */}
      <aside className="mx-auto w-full max-w-xl rounded-xl bg-honeydew/85 p-4 lg:max-w-none">
        <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-steel/80">
          Historial
        </h2>
        {historial.length === 0 ? (
          <p className="mt-3 px-1 text-sm text-steel">Sin notas anteriores.</p>
        ) : (
          <ol className="mt-3 max-h-[34rem] overflow-y-auto border-l border-frosted">
            {historial.map((n) => (
              <li key={n.id} className="py-2 pl-4">
                <p className="text-xs text-steel">
                  <time dateTime={n.creadaEn.toISOString()}>
                    {formatearDiaFechaHora(n.creadaEn)}
                  </time>{" "}
                  · {n.autor}
                  {n.ediciones > 0 && " · editada"}
                </p>
                <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap break-words text-sm">
                  {n.contenido}
                </p>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </section>
  );
}

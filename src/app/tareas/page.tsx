import type { Metadata } from "next";
import EncabezadoModulo from "@/components/encabezado-modulo";
import FormularioTarea from "@/components/formulario-tarea";
import BotonAccion from "@/components/boton-accion";
import BotonConfirmar from "@/components/boton-confirmar";
import {
  borrarTarea,
  cargarTareasEjemplo,
  deshacerHechaAccion,
  marcarHechaAccion,
} from "@/actions/tareas";
import { obtenerModulo } from "@/lib/modulos";
import { obtenerTareasFortuitas, obtenerTareasPeriodicas } from "@/lib/tareas";
import {
  textoFrecuencia,
  textoPeriodoActual,
  textoPlazo,
} from "@/lib/plantillas-tareas";
import {
  diasRestantes,
  formatearDiaFechaHora,
  formatearFecha,
} from "@/lib/fechas";
import { estiloUrgencia } from "@/lib/urgencia";

export const metadata: Metadata = { title: "Tareas pendientes" };

export default async function TareasPage() {
  const hoy = new Date();
  const [periodicas, fortuitas] = await Promise.all([
    obtenerTareasPeriodicas(hoy),
    obtenerTareasFortuitas(),
  ]);

  // las que faltan hacer en su periodo van primero
  const ordenadas = [...periodicas].sort(
    (a, b) => Number(a.completa) - Number(b.completa),
  );
  const alDia = periodicas.filter((t) => t.completa).length;

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/tareas")}
        titulo="Tareas pendientes"
        descripcion="Tareas que se repiten y pendientes puntuales del equipo."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 gap-8">
          {/* periódicas */}
          <section>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Tareas periódicas</h2>
              {periodicas.length > 0 && (
                <span className="text-sm text-steel">
                  {alDia} de {periodicas.length} al día
                </span>
              )}
            </div>

            {periodicas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-frosted bg-white p-5 text-sm text-steel">
                <p>
                  Todavía no hay tareas periódicas. Créalas con el formulario o
                  parte con algunas de ejemplo (ingreso de controlados al ISP,
                  limpieza de mesón, reposición de refrigeradores y registro de
                  temperaturas).
                </p>
                <div className="mt-3">
                  <BotonAccion
                    texto="Agregar tareas de ejemplo"
                    textoPendiente="Agregando..."
                    accion={cargarTareasEjemplo}
                  />
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-frosted/60 rounded-xl border border-frosted bg-white shadow-sm">
                {ordenadas.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1 basis-56">
                      <p
                        className={`font-medium ${t.completa ? "text-steel" : ""}`}
                      >
                        {t.titulo}
                      </p>
                      {t.detalle && (
                        <p className="text-sm text-steel">{t.detalle}</p>
                      )}
                      <p className="mt-0.5 text-xs text-steel">
                        {textoFrecuencia(t.veces, t.periodo)}
                        {" · "}
                        {t.ultimaVez
                          ? `Última vez: ${formatearDiaFechaHora(t.ultimaVez)}`
                          : "Nunca se ha hecho"}
                      </p>
                    </div>

                    {/* avance del periodo actual */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                        t.completa
                          ? "bg-sage/15 text-sage"
                          : "bg-saffron/25 text-deep-space"
                      }`}
                    >
                      {t.completa ? "✓ " : ""}
                      {t.hechas}/{t.veces} {textoPeriodoActual(t.periodo)}
                    </span>

                    <div className="flex items-center gap-1">
                      {t.hechas > 0 && (
                        <BotonAccion
                          texto="Deshacer"
                          textoPendiente="..."
                          variante="secundario"
                          accion={deshacerHechaAccion.bind(null, t.id)}
                        />
                      )}
                      {!t.completa && (
                        <BotonAccion
                          texto="Marcar como hecha"
                          icono="check"
                          accion={marcarHechaAccion.bind(null, t.id)}
                        />
                      )}
                      <BotonConfirmar
                        texto="Eliminar"
                        soloIcono
                        titulo="¿Eliminar tarea?"
                        descripcion={
                          <>
                            Se eliminará <strong>{t.titulo}</strong> y su
                            historial de veces hechas.
                          </>
                        }
                        accion={borrarTarea.bind(null, t.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* fortuitas */}
          <section>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Tareas fortuitas</h2>
              {fortuitas.pendientes.length > 0 && (
                <span className="text-sm text-steel">
                  {fortuitas.pendientes.length} pendiente
                  {fortuitas.pendientes.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {fortuitas.pendientes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-frosted bg-white p-5 text-sm text-steel">
                No hay tareas fortuitas pendientes.
              </p>
            ) : (
              <ul className="divide-y divide-frosted/60 rounded-xl border border-frosted bg-white shadow-sm">
                {fortuitas.pendientes.map((t) => {
                  const dias = t.fechaLimite
                    ? diasRestantes(t.fechaLimite)
                    : null;
                  return (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="font-medium">{t.titulo}</p>
                        {t.detalle && (
                          <p className="text-sm text-steel">{t.detalle}</p>
                        )}
                        <p className="mt-0.5 text-xs text-steel">
                          Creada el {formatearDiaFechaHora(t.creadaEn)}
                          {t.fechaLimite &&
                            ` · Límite: ${formatearFecha(t.fechaLimite)}`}
                        </p>
                      </div>

                      {dias !== null && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estiloUrgencia(dias)}`}
                        >
                          {textoPlazo(dias)}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <BotonAccion
                          texto="Marcar como hecha"
                          icono="check"
                          accion={marcarHechaAccion.bind(null, t.id)}
                        />
                        <BotonConfirmar
                          texto="Eliminar"
                          soloIcono
                          titulo="¿Eliminar tarea?"
                          descripcion={
                            <>
                              Se eliminará <strong>{t.titulo}</strong>.
                            </>
                          }
                          accion={borrarTarea.bind(null, t.id)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {fortuitas.hechas.length > 0 && (
              <details className="mt-4 rounded-xl border border-frosted bg-white/60">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-steel">
                  Hechas recientemente ({fortuitas.hechas.length})
                </summary>
                <ul className="divide-y divide-frosted/60 border-t border-frosted/60">
                  {fortuitas.hechas.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5"
                    >
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="text-sm text-steel line-through">
                          {t.titulo}
                        </p>
                        {t.completadaEn && (
                          <p className="text-xs text-steel">
                            Hecha el {formatearDiaFechaHora(t.completadaEn)}
                          </p>
                        )}
                      </div>
                      <BotonAccion
                        texto="Deshacer"
                        textoPendiente="..."
                        variante="secundario"
                        accion={deshacerHechaAccion.bind(null, t.id)}
                      />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h2 className="mb-4 font-semibold">Nueva tarea</h2>
          <FormularioTarea />
        </section>
      </div>
    </main>
  );
}

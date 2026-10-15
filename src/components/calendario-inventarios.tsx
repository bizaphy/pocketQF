import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { claveDia, claveMes, mesVecino, semanasDelMes } from "@/lib/calendario";

export type InventarioDelDia = { id: number; finalizado: boolean };

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

// Calendario de un mes con los días en que se hizo inventario.
// Un inventario ese día → lleva directo a él; varios → filtra la tabla de abajo por ese día.
// La navegación entre meses cambia ?mes= en la URL y la página vuelve a consultar.
export default function CalendarioInventarios({
  mes,
  hoy,
  porDia,
  diaElegido,
}: {
  mes: Date; // primer día del mes a mostrar
  hoy: Date;
  porDia: Map<string, InventarioDelDia[]>; // clave "yyyy-MM-dd"
  diaElegido?: string;
}) {
  const anterior = claveMes(mesVecino(mes, -1));
  const siguiente = claveMes(mesVecino(mes, 1));
  const esMesActual = claveMes(mes) === claveMes(hoy); // no se navega al futuro
  const claveHoy = claveDia(hoy);

  const flecha =
    "flex size-8 items-center justify-center rounded-lg text-lg text-deep-space hover:bg-honeydew";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/inventario?mes=${anterior}`}
          className={flecha}
          aria-label="Mes anterior"
        >
          ‹
        </Link>
        <p className="font-semibold capitalize">
          {format(mes, "MMMM yyyy", { locale: es })}
        </p>
        {esMesActual ? (
          <span className="size-8" />
        ) : (
          <Link
            href={`/inventario?mes=${siguiente}`}
            className={flecha}
            aria-label="Mes siguiente"
          >
            ›
          </Link>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="pb-1 text-xs font-semibold text-steel">
            {d}
          </div>
        ))}

        {semanasDelMes(mes)
          .flat()
          .map((dia) => {
            const lista = dia.delMes ? (porDia.get(dia.clave) ?? []) : [];
            const enCurso = lista.some((i) => !i.finalizado);
            const base = `relative flex aspect-square items-center justify-center rounded-lg tabular-nums ${
              dia.clave === claveHoy ? "ring-2 ring-deep-space/40" : ""
            } ${dia.clave === diaElegido ? "outline-2 outline-offset-2 outline-deep-space" : ""}`;

            if (lista.length === 0) {
              return (
                <div
                  key={dia.clave}
                  className={`${base} ${dia.delMes ? "text-deep-space" : "text-frosted"}`}
                >
                  {dia.numero}
                </div>
              );
            }

            const href =
              lista.length === 1
                ? `/inventario/${lista[0].id}`
                : `/inventario?mes=${claveMes(mes)}&dia=${dia.clave}#historial`;

            return (
              <Link
                key={dia.clave}
                href={href}
                title={`${lista.length} inventario${lista.length > 1 ? "s" : ""}${enCurso ? " (alguno en curso)" : ""}`}
                className={`${base} font-semibold transition-colors ${
                  enCurso
                    ? "border-2 border-saffron bg-saffron/15 hover:bg-saffron/30"
                    : "bg-saffron text-deep-space hover:bg-saffron/80"
                }`}
              >
                {dia.numero}
                {lista.length > 1 && (
                  <span className="absolute right-0.5 top-0.5 rounded-full bg-deep-space px-1 text-[10px] leading-4 text-honeydew">
                    {lista.length}
                  </span>
                )}
              </Link>
            );
          })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-steel">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-saffron" /> Finalizado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded border-2 border-saffron bg-saffron/15" />{" "}
          En curso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded ring-2 ring-deep-space/40" /> Hoy
        </span>
      </div>
    </div>
  );
}

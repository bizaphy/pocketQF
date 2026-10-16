// Gráfico de columnas del reporte: lotes que vencen en cada uno de los próximos 12 meses.
// La columna del mes de mayor riesgo (más unidades) va en rojo y con etiqueta; el resto en azul.
// Al pasar el mouse (o enfocar con teclado) cada columna muestra su detalle. Solo CSS, sin JavaScript.

import type { MesReporte } from "@/lib/reporte-vencimientos";

const ALTO = 220; // alto del área de columnas en px

// marcas del eje: números redondos (1, 2, 5, 10, 20, 50...) para no tener más de 4 tramos
function marcasEje(maximo: number): number[] {
  if (maximo <= 0) return [0];
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const paso =
    [1, 2, 5, 10].map((f) => f * potencia).find((p) => p >= bruto) ?? bruto;
  const pasoEntero = Math.max(1, Math.ceil(paso));
  const marcas = [];
  for (let v = 0; v < maximo + pasoEntero; v += pasoEntero) marcas.push(v);
  return marcas;
}

export default function GraficoVencimientosMes({
  meses,
  mayorRiesgo,
}: {
  meses: MesReporte[];
  mayorRiesgo: number | null;
}) {
  const marcas = marcasEje(Math.max(...meses.map((m) => m.lotes)));
  const tope = marcas[marcas.length - 1] || 1;

  return (
    <figure>
      <div className="flex gap-2">
        {/* eje vertical: solo los números, alineados con las líneas guía */}
        <div className="relative w-6 shrink-0" style={{ height: ALTO }} aria-hidden>
          {marcas.map((v) => (
            <span
              key={v}
              className="absolute right-0 translate-y-1/2 text-xs tabular-nums text-steel"
              style={{ bottom: `${(v / tope) * 100}%` }}
            >
              {v}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: ALTO }}>
            {/* líneas guía finas y discretas */}
            {marcas.map((v) => (
              <span
                key={v}
                className={`absolute inset-x-0 h-px ${v === 0 ? "bg-steel/40" : "bg-frosted/50"}`}
                style={{ bottom: `${(v / tope) * 100}%` }}
                aria-hidden
              />
            ))}

            <ol className="absolute inset-0 grid grid-cols-12 gap-0.5">
              {meses.map((m, i) => {
                const riesgo = i === mayorRiesgo;
                const alto = (m.lotes / tope) * 100;
                return (
                  <li
                    key={m.clave}
                    tabIndex={0}
                    aria-label={`${m.etiqueta}: ${m.lotes} lotes, ${m.unidades} unidades, ${m.productos} productos${riesgo ? ". Mes de mayor riesgo" : ""}`}
                    // toda la franja del mes es zona de hover, no solo la columna
                    className="group relative flex h-full items-end justify-center outline-none"
                  >
                    {m.lotes > 0 && (
                      <span
                        className={`w-full max-w-6 rounded-t transition-opacity group-hover:opacity-80 group-focus:opacity-80 ${riesgo ? "bg-strawberry" : "bg-steel"}`}
                        style={{ height: `${alto}%` }}
                      />
                    )}

                    {/* etiqueta fija sobre la columna de mayor riesgo */}
                    {riesgo && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-deep-space shadow-sm ring-1 ring-strawberry/40 group-hover:invisible group-focus:invisible"
                        style={{ bottom: `calc(${alto}% + 6px)` }}
                        aria-hidden
                      >
                        ⚠ {m.unidades} u.
                      </span>
                    )}

                    {/* detalle al pasar el mouse */}
                    <span
                      className={`pointer-events-none invisible absolute z-10 w-40 rounded-lg bg-deep-space px-3 py-2 text-xs text-honeydew shadow-lg group-hover:visible group-focus:visible ${
                        i < 2 ? "left-0" : i > 9 ? "right-0" : "left-1/2 -translate-x-1/2"
                      }`}
                      style={{ bottom: `calc(${alto}% + 8px)` }}
                      aria-hidden
                    >
                      <b className="block capitalize">{m.etiqueta}</b>
                      {m.lotes} {m.lotes === 1 ? "lote" : "lotes"} · {m.unidades}{" "}
                      {m.unidades === 1 ? "unidad" : "unidades"}
                      <br />
                      {m.productos} {m.productos === 1 ? "producto" : "productos"}
                      {riesgo && (
                        <b className="mt-1 block">⚠ Mes de mayor riesgo</b>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* meses bajo cada columna */}
          <div className="mt-2 grid grid-cols-12 gap-0.5" aria-hidden>
            {meses.map((m, i) => (
              <span
                key={m.clave}
                className={`text-center text-[11px] capitalize leading-tight ${i === mayorRiesgo ? "font-semibold text-deep-space" : "text-steel"}`}
              >
                {m.etiqueta.split(" ")[0]}
                <span className="block text-[10px] opacity-70">
                  {m.etiqueta.split(" ")[1].slice(2)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-steel">
        Lotes que vencen cada mes. En rojo, el mes con más unidades por vencer.
      </figcaption>
    </figure>
  );
}

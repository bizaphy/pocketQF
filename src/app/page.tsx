import { productosPlaceHolder } from "@/data/productos";

//HELPERS

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function diasRestantes(fechaVencimiento: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); //para que sea el valor a media noche, al restar seran numeros enteros.
  const vence = new Date(`${fechaVencimiento}T00:00:00`); //ej. ("2026-10-02T00:00:00") es el dia a media noche
  return Math.round((vence.getTime() - hoy.getTime()) / MS_POR_DIA); //el round es por si llega a cambiar la hora y el gettime deja la fecha en MS.
}

function formatearFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CL"); //para D-M-Y
}

//para fechaUltimaRevision se necesita la fecha y la hora, por eso usamos toLocaleString
function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

//clases TW (colores de la paleta definidos en globals.css)
//semaforo: rojo fuerte (vencido) → rojo suave (urgente) → amarillo (pronto) → azul suave (sin apuro)
function estiloUrgencia(dias: number): string {
  if (dias < 0) return "bg-strawberry text-white"; //vencido
  if (dias <= 30) return "bg-strawberry/15 text-strawberry"; //urgente
  if (dias <= 90) return "bg-saffron/30 text-deep-space"; //pronto (texto azul oscuro: el amarillo no se lee como texto)
  return "bg-steel/10 text-steel"; //sin apuro
}

//texto de la etiqueta: "Vencido", "1 día" (singular) o "N días"
function textoDias(dias: number): string {
  if (dias < 0) return "Vencido";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

// PREPARADOR DE DATOS

const productos = [...productosPlaceHolder].sort(
  (a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento), //ej. "2026-10-02" < "2026-10-04" < "2026-10-15" debe hacerse con el formato Y-M-D (ISO), no con el CL
);

export default function Home() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-steel">
          PocketQF
        </p>
        <h1 className="mt-1 text-3xl font-bold text-deep-space">
          Vencimientos
        </h1>
        <p className="mt-1 text-steel">
          Productos ordenados por fecha de vencimiento, del más próximo al más
          lejano.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
            <tr>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Vence</th>
              <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
              <th className="px-4 py-3 font-semibold">Última revisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-frosted/60">
            {productos.map((producto) => {
              const dias = diasRestantes(producto.fechaVencimiento);
              return (
                <tr
                  key={producto.sku}
                  className="transition-colors hover:bg-honeydew"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-steel">
                    {producto.sku}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {producto.nombre}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatearFecha(producto.fechaVencimiento)}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${estiloUrgencia(dias)}`}
                    >
                      {textoDias(dias)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {producto.cantidad}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-steel">
                    {formatearFechaHora(producto.ultimaRevision)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

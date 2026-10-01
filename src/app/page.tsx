import { productosPlaceHolder } from "@/data/productos";
import Image from "next/image";

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

//clases TW
function estiloUrgencia(dias: number): string {
  if (dias <= 30) return "bg-red-100 text-red-700";
  if (dias <= 90) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

// PREPARADOR DE DATOS

const productos = [...productosPlaceHolder].sort(
  (a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento), //ej. "2026-10-02" < "2026-10-04" < "2026-10-15" debe hacerse con el formato Y-M-D (ISO), no con el CL
);

export default function Home() {
  return (
    <main>
      <header> Tabla de vencimientos </header>
      <div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Vence</th>
              <th>Cantidad</th>
              <th>Última revisión</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const dias = diasRestantes(producto.fechaVencimiento);
              return (
                <tr key={producto.sku}>
                  <td>{producto.sku}</td>
                  <td>{producto.nombre}</td>
                  <td key={producto.sku}>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${estiloUrgencia(dias)}`}
                    >
                      {dias < 0 ? "Vencido" : `${dias} días`}
                    </span>
                  </td>
                  <td>{producto.cantidad}</td>
                  <td>{formatearFechaHora(producto.ultimaRevision)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

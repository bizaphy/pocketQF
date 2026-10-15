import Link from "next/link";
import EncabezadoModulo from "@/components/encabezado-modulo";
import { obtenerModulo } from "@/lib/modulos";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cómo armar el Excel" };

// Las reglas de esta guía son las que aplica leerExcelProductos (src/lib/importar-productos.ts).
// Si cambia esa función, hay que revisar este texto.

const COLUMNAS = [
  {
    nombre: "Código de Barras",
    obligatoria: "Sí",
    regla: "Formato de celda Texto, sin espacios. No puede estar vacío.",
  },
  {
    nombre: "Nombre",
    obligatoria: "Sí",
    regla: "El encabezado debe decir exactamente “Nombre”. No puede estar vacío.",
  },
  {
    nombre: "Stock",
    obligatoria: "Sí",
    regla:
      "Número entero (0, 5, 120). Vacío cuenta como 0. Sirve “Stock en Farmacias Patagonia”.",
  },
  {
    nombre: "Categoría",
    obligatoria: "Columna sí, dato no",
    regla: "Si la celda queda vacía, el producto aparece como “Sin categoría”.",
  },
];

const ERRORES = [
  {
    error: "Subir solo una parte de los productos",
    consecuencia:
      "Todo producto que no venga en el archivo queda inactivo. Sube siempre el listado completo.",
  },
  {
    error: "El código de barras se pierde o cambia",
    consecuencia:
      "Si la celda es Número, Excel borra los ceros a la izquierda (0736… pasa a 736…) y el producto no coincide con el de la semana anterior. Marca la columna como Texto antes de pegar los datos.",
  },
  {
    error: "Stock con decimales, guiones o texto",
    consecuencia:
      "Valores como 2,5, “-”, “N/A” o “sin stock” hacen que se rechace el archivo completo. Usa 0 o deja la celda vacía.",
  },
  {
    error: "Encabezados en otra fila o en otra hoja",
    consecuencia:
      "Solo se lee la primera hoja y los encabezados deben estar en la fila 1. Borra títulos, logos o filas en blanco que estén arriba.",
  },
  {
    error: "Dos columnas que empiezan con “Stock”",
    consecuencia:
      "Se usa la primera de izquierda a derecha. Deja una sola columna de stock o pon la correcta antes.",
  },
  {
    error: "Guardar como .xls o .csv",
    consecuencia:
      "Solo se acepta .xlsx. En Excel: Archivo › Guardar como › Libro de Excel (.xlsx).",
  },
  {
    error: "Códigos repetidos",
    consecuencia:
      "No bloquea la carga, pero se queda con la última fila y avisa. Revisa que no haya duplicados.",
  },
];

export default function GuiaExcelPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10">
      <EncabezadoModulo
        modulo={obtenerModulo("/productos")}
        titulo="Cómo armar el Excel"
        descripcion="Reglas para que la carga semanal de productos salga bien a la primera."
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <a
          href="/productos-ejemplo.xlsx"
          download
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew hover:bg-deep-space/90"
        >
          Descargar Excel de ejemplo
        </a>
        <Link
          href="/productos"
          className="rounded-lg border border-frosted bg-white px-4 py-2 text-sm font-semibold text-deep-space hover:bg-honeydew"
        >
          ← Volver a Base de productos
        </Link>
      </div>

      <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Lo básico</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-steel">
          <li>
            Archivo <b>.xlsx</b> de hasta <b>5 MB</b>.
          </li>
          <li>
            Se lee <b>solo la primera hoja</b>, con los encabezados en la{" "}
            <b>fila 1</b> y un producto por fila desde la fila 2.
          </li>
          <li>
            Las columnas se buscan por su nombre: el orden no importa, ni las
            mayúsculas ni las tildes. Las demás columnas (SKU, Coste, Precio,
            etc.) se ignoran.
          </li>
          <li>
            Las filas completamente vacías se saltan.
          </li>
          <li>
            Si hay <b>cualquier error</b>, no se guarda nada y se muestra la
            fila del problema. Corrige y vuelve a subir.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Columnas que se leen</h2>
        <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
              <tr>
                <th className="px-4 py-3 font-semibold">Encabezado</th>
                <th className="px-4 py-3 font-semibold">Obligatoria</th>
                <th className="px-4 py-3 font-semibold">Qué debe tener</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-frosted/60">
              {COLUMNAS.map((c) => (
                <tr key={c.nombre}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {c.nombre}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {c.obligatoria}
                  </td>
                  <td className="px-4 py-3 text-steel">{c.regla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Errores comunes</h2>
        <ul className="grid gap-3">
          {ERRORES.map((e) => (
            <li
              key={e.error}
              className="rounded-xl border border-frosted bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-strawberry">{e.error}</p>
              <p className="mt-1 text-sm text-steel">{e.consecuencia}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Antes de subir, revisa</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-steel">
          <li>Es el listado completo de la semana, no un filtro.</li>
          <li>
            La fila 1 tiene Código de Barras, Nombre, Stock y Categoría.
          </li>
          <li>La columna de códigos está en formato Texto.</li>
          <li>El stock tiene solo números enteros o celdas vacías.</li>
          <li>Está guardado como .xlsx.</li>
        </ol>
      </section>
    </main>
  );
}

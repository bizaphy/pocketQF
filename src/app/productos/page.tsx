import Image from "next/image";
import Link from "next/link";
import FormularioImportacion from "@/components/formulario-importacion";
import Interruptor from "@/components/interruptor";
import EncabezadoModulo from "@/components/encabezado-modulo";
import { obtenerModulo } from "@/lib/modulos";
import {
  contarProductosPorCategoria,
  obtenerUltimaImportacion,
} from "@/lib/consultas";
import { formatearDiaFechaHora } from "@/lib/fechas";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosPage({
  searchParams,
}: PageProps<"/productos">) {
  // por defecto no se cuentan los productos con stock 0; ?sinStock=1 los incluye
  const incluirSinStock = (await searchParams).sinStock === "1";

  const [ultima, categorias] = await Promise.all([
    obtenerUltimaImportacion(),
    contarProductosPorCategoria(incluirSinStock),
  ]);
  const totalActivos = categorias.reduce((s, c) => s + c.productos, 0);

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 pt-10 pb-20">
      <EncabezadoModulo
        modulo={obtenerModulo("/productos")}
        titulo="Base de productos"
        descripcion="Sube el Excel semanal para actualizar código de barra, stock y categoría de cada producto."
      />

      <section className="rounded-xl border border-frosted bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold">
          {/* logo de Excel (Wikimedia Commons, 486x500); al ser .svg, Image no lo optimiza */}
          <Image src="/excel.svg" alt="" width={23} height={24} />
          Subir Excel
        </h2>
        <p className="mb-4 mt-1 text-sm text-steel">
          Se leen las columnas <b>Código de Barras</b>, <b>Nombre</b>,{" "}
          <b>Stock</b> y <b>Categoría</b>; el resto se ignora. Los productos que
          no vengan en el archivo quedan inactivos.
        </p>
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {/* archivo estático en /public; download hace que se baje en vez de abrirse */}
          <a
            href="/productos-ejemplo.xlsx"
            download
            className="font-medium text-deep-space underline underline-offset-2 hover:text-steel"
          >
            Descargar Excel de ejemplo
          </a>
          <Link
            href="/productos/guia-excel"
            className="font-medium text-deep-space underline underline-offset-2 hover:text-steel"
          >
            Cómo armar bien el Excel
          </Link>
        </div>
        <FormularioImportacion />
        <p className="mt-4 text-xs text-steel">
          {ultima
            ? `Última actualización: ${formatearDiaFechaHora(ultima.creadaEn)} · ${ultima.archivo}`
            : "Todavía no se ha subido ningún Excel."}
        </p>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            Productos activos por categoría{" "}
            <span className="font-normal text-steel">({totalActivos})</span>
          </h2>
          {/* cambia la URL y la página vuelve a consultar con o sin stock 0 */}
          <Interruptor
            activo={incluirSinStock}
            href={incluirSinStock ? "/productos" : "/productos?sinStock=1"}
          >
            Incluir productos sin stock
          </Interruptor>
        </div>
        <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
              <tr>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Productos
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Stock total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-frosted/60">
              {categorias.map((c) => (
                <tr
                  key={c.categoria ?? "sin-categoria"}
                  className="transition-colors hover:bg-honeydew"
                >
                  <td className="px-4 py-3">
                    {c.categoria ?? "Sin categoría"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.productos}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

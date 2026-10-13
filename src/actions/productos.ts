"use server";
// recibe el Excel semanal de productos, lo valida y actualiza la base
import { revalidatePath } from "next/cache";
import { reemplazarBaseProductos } from "@/lib/consultas";
import { leerExcelProductos } from "@/lib/importar-productos";

export type EstadoImportacion =
  | {
      ok: true;
      mensaje: string;
      id: number;
      total: number;
      nuevos: number;
      actualizados: number;
      desactivados: number;
      avisos: string[];
    }
  | { ok: false; mensaje: string; errores: string[] }
  | null;

const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB (bodySizeLimit en next.config.ts está un poco más arriba)

export async function importarProductos(
  _estadoAnterior: EstadoImportacion, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoImportacion> {
  // 1. revisar el archivo antes de abrirlo
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, mensaje: "Elige un archivo", errores: [] };
  }
  if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false,
      mensaje: "El archivo debe ser .xlsx",
      errores: [`"${archivo.name}" no es un Excel .xlsx`],
    };
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return {
      ok: false,
      mensaje: "El archivo es muy grande",
      errores: ["El máximo es 5 MB"],
    };
  }

  // 2. leer y validar las filas. Si hay errores no se guarda nada (una carga a medias desactivaría productos reales)
  const lectura = await leerExcelProductos(await archivo.arrayBuffer());
  if (!lectura.ok) {
    return {
      ok: false,
      mensaje: "No se importó nada: revisa el Excel",
      errores: lectura.errores,
    };
  }

  // 3. guardar
  const importacion = reemplazarBaseProductos(lectura.filas, archivo.name);

  // 4. los productos aparecen en varias páginas (buscador, vencimientos, esta misma)
  revalidatePath("/", "layout");

  return {
    ok: true,
    mensaje: `Base actualizada: ${importacion.total} productos`,
    id: importacion.id,
    total: importacion.total,
    nuevos: importacion.nuevos,
    actualizados: importacion.actualizados,
    desactivados: importacion.desactivados,
    avisos: lectura.avisos,
  };
}

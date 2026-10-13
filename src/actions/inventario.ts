"use server";
// acciones del inventario del día: generar la lista de productos y guardar lo contado
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { esquemaConteo, esquemaGenerarInventario } from "@/lib/esquemas";
import { generarInventario, guardarConteos } from "@/lib/inventario";

export type EstadoGenerar = {
  ok: false;
  mensaje: string;
  errores?: Record<string, string[] | undefined>;
} | null;

export async function generarInventarioAccion(
  _estadoAnterior: EstadoGenerar, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoGenerar> {
  const resultado = esquemaGenerarInventario.safeParse({
    modo: formData.get("modo"),
    categoria: formData.get("categoria") ?? undefined,
    cantidad: formData.get("cantidad"),
    diasSinRepetir: formData.get("diasSinRepetir"),
    incluirSinStock: formData.get("incluirSinStock") === "on", // checkbox: "on" si está marcado
  });
  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(resultado.error).fieldErrors,
    };
  }

  const r = generarInventario(resultado.data);
  if (!r.ok) {
    return {
      ok: false,
      mensaje:
        r.total === 0
          ? "No hay productos que cumplan los filtros"
          : `Los ${r.total} productos que cumplen los filtros se contaron en los últimos ${resultado.data.diasSinRepetir} días`,
    };
  }

  revalidatePath("/inventario");
  // redirect lanza una excepción controlada: nada después de esta línea se ejecuta
  redirect(
    `/inventario/${r.id}?generado=${r.elegidos}&recientes=${r.recientes}`,
  );
}

export type EstadoConteo =
  | { ok: true; mensaje: string }
  | { ok: false; mensaje: string; errores?: Record<number, string> }
  | null;

export async function guardarConteoAccion(
  _estadoAnterior: EstadoConteo, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoConteo> {
  const inventarioId = Number(formData.get("inventarioId"));
  const finalizar = formData.get("intencion") === "finalizar"; // qué botón se presionó

  // cada input se llama "contado-<id del item>"
  const conteos: { itemId: number; contado: number | null }[] = [];
  const errores: Record<number, string> = {};
  for (const [campo, valor] of formData) {
    if (!campo.startsWith("contado-")) continue;
    const itemId = Number(campo.slice("contado-".length));
    const r = esquemaConteo.safeParse(String(valor).trim());
    if (r.success) conteos.push({ itemId, contado: r.data });
    else errores[itemId] = r.error.issues[0].message;
  }

  if (Object.keys(errores).length > 0) {
    return { ok: false, mensaje: "Hay cantidades no válidas", errores };
  }

  const r = guardarConteos(inventarioId, conteos, finalizar);
  if (!r.ok) return { ok: false, mensaje: r.mensaje };

  revalidatePath("/inventario");
  revalidatePath(`/inventario/${inventarioId}`);

  if (finalizar) return { ok: true, mensaje: "Inventario finalizado" };
  return {
    ok: true,
    mensaje:
      r.pendientes === 0
        ? "Conteo guardado. Ya está todo contado: puedes finalizar"
        : `Conteo guardado. Faltan ${r.pendientes} por contar`,
  };
}

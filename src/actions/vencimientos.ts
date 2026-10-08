"use server";
// función que se ejecuta en el servidor cuando el usuario envía el formulario de venc.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { existeProducto, insertarVencimiento } from "@/lib/consultas";
import { esquemaVencimiento } from "@/lib/esquemas";

// caso 1: se guardó bien
type EstadoExito = {
  ok: true;
  mensaje: string;
  id: number;
};

// caso 2: algo falló
type EstadoError = {
  ok: false;
  mensaje: string;
  errores?: Record<string, string[] | undefined>; // mensajes por campo
  valores?: Record<string, string>; // lo que había escrito el usuario
};

// el estado es uno de los dos, o null si todavía no se envía nada
export type EstadoFormulario = EstadoExito | EstadoError | null;

// crea un vencimiento nuevo: valida, revisa que el producto exista, guarda y refresca la lista
export async function crearVencimiento(
  _estadoAnterior: EstadoFormulario, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoFormulario> {
  // 0. leer los campos del formulario (todo llega como texto)
  const valores = {
    productoId: String(formData.get("productoId") ?? ""),
    lote: String(formData.get("lote") ?? ""),
    fechaVencimiento: String(formData.get("fechaVencimiento") ?? ""),
    cantidad: String(formData.get("cantidad") ?? ""),
  };

  // 1. validar con zod (sin lanzar errores)
  const resultado = esquemaVencimiento.safeParse(valores);
  //
  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(resultado.error).fieldErrors,
      valores, //  devuelve lo que escribio, para no borrarle lo que escribió
    };
  }

  // 2. el producto debe existir (zod no sabe nada de la BD)
  if (!existeProducto(resultado.data.productoId)) {
    return {
      ok: false,
      mensaje: "El producto no existe o está inactivo",
      errores: { productoId: ["Elige un producto de la lista"] },
      valores,
    };
  }

  // 3. guardar
  const nuevo = insertarVencimiento(resultado.data);

  // 4. que /vencimientos muestre el dato nuevo y no use el router cache
  revalidatePath("/vencimientos");

  return { ok: true, mensaje: "Vencimiento guardado", id: nuevo.id };
}

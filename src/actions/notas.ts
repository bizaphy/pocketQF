"use server";
// guarda una nota nueva del post-it del inicio
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertarNota } from "@/lib/consultas";
import { esquemaNota } from "@/lib/esquemas";

export type EstadoNota =
  | { ok: true; mensaje: string; id: number }
  | {
      ok: false;
      mensaje: string;
      errores?: Record<string, string[] | undefined>;
      valores?: Record<string, string>; // lo que había escrito, para no borrarlo
    }
  | null;

export async function crearNota(
  _estadoAnterior: EstadoNota, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoNota> {
  const valores = {
    contenido: String(formData.get("contenido") ?? ""),
    autor: String(formData.get("autor") ?? ""),
  };

  const resultado = esquemaNota.safeParse(valores);
  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa la nota",
      errores: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }

  // la fecha la pone el servidor al insertar (no se confía en el reloj del navegador)
  const nueva = insertarNota(resultado.data);

  revalidatePath("/");

  return { ok: true, mensaje: "Nota del día publicada", id: nueva.id };
}

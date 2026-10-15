"use server";
// guarda una nota nueva del post-it del inicio, o edita la nota del día
import { isToday } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { editarNota, insertarNota, obtenerNota } from "@/lib/consultas";
import { esquemaEdicionNota, esquemaNota } from "@/lib/esquemas";

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

export type EstadoEdicionNota = {
  ok: boolean;
  mensaje: string;
  errores?: Record<string, string[] | undefined>;
} | null;

export async function editarNotaAccion(
  _estadoAnterior: EstadoEdicionNota, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoEdicionNota> {
  const r = esquemaEdicionNota.safeParse({
    id: formData.get("id"),
    contenido: formData.get("contenido") ?? "",
    editor: formData.get("editor") ?? "",
  });
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa la nota",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }

  const nota = obtenerNota(r.data.id);
  if (!nota) return { ok: false, mensaje: "La nota ya no existe" };
  // las notas de días anteriores quedan como registro: solo se edita la de hoy
  if (!isToday(nota.creadaEn)) {
    return { ok: false, mensaje: "Solo se puede editar la nota de hoy" };
  }
  if (nota.contenido === r.data.contenido) {
    return { ok: false, mensaje: "La nota no tiene cambios" };
  }

  editarNota(r.data);
  revalidatePath("/");
  return { ok: true, mensaje: "Nota editada" };
}

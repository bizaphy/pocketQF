"use server";
// acciones de tareas pendientes: crear, marcar hecha, deshacer y eliminar
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { esquemaTarea } from "@/lib/esquemas";
import {
  deshacerHecha,
  eliminarTarea,
  insertarTarea,
  insertarTareasEjemplo,
  marcarHecha,
} from "@/lib/tareas";

type Resultado = { ok: boolean; mensaje: string };

export type EstadoTarea =
  | { ok: true; mensaje: string; id: number }
  | {
      ok: false;
      mensaje: string;
      errores?: Record<string, string[] | undefined>;
    }
  | null;

const idValido = (id: number) => Number.isInteger(id) && id > 0;

export async function crearTarea(
  _estadoAnterior: EstadoTarea, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoTarea> {
  const r = esquemaTarea.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo") ?? "",
    detalle: formData.get("detalle") ?? "",
    veces: formData.get("veces") ?? undefined,
    periodo: formData.get("periodo") ?? undefined,
    fechaLimite: formData.get("fechaLimite") ?? "",
  });
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }

  const nueva = insertarTarea(r.data);
  revalidatePath("/tareas");
  return { ok: true, mensaje: `Tarea "${nueva.titulo}" creada`, id: nueva.id };
}

export async function marcarHechaAccion(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Tarea no válida" };
  const tarea = marcarHecha(id);
  if (!tarea) return { ok: false, mensaje: "La tarea ya no existe" };
  revalidatePath("/tareas");
  return { ok: true, mensaje: `"${tarea.titulo}" marcada como hecha` };
}

export async function deshacerHechaAccion(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Tarea no válida" };
  const tarea = deshacerHecha(id, new Date());
  if (!tarea) return { ok: false, mensaje: "No hay nada que deshacer" };
  revalidatePath("/tareas");
  return { ok: true, mensaje: `"${tarea.titulo}" vuelve a pendiente` };
}

export async function borrarTarea(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Tarea no válida" };
  const borrada = eliminarTarea(id);
  if (!borrada) return { ok: false, mensaje: "La tarea ya no existe" };
  revalidatePath("/tareas");
  return { ok: true, mensaje: `Tarea "${borrada.titulo}" eliminada` };
}

export async function cargarTareasEjemplo(): Promise<Resultado> {
  const nuevas = insertarTareasEjemplo();
  revalidatePath("/tareas");
  return { ok: true, mensaje: `${nuevas.length} tareas de ejemplo agregadas` };
}

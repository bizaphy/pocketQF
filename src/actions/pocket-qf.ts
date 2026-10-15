"use server";
// acciones de Pocket QF: crear, editar y eliminar fichas, y asociar productos a mano
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { esquemaFicha } from "@/lib/esquemas";
import { existeProducto } from "@/lib/consultas";
import {
  actualizarFicha,
  desvincularProducto,
  eliminarFicha,
  existeFichaConPrincipio,
  insertarFicha,
  vincularProducto,
} from "@/lib/fichas";

type Resultado = { ok: boolean; mensaje: string };

export type EstadoFicha = {
  ok: boolean;
  mensaje: string;
  errores?: Record<string, string[] | undefined>;
} | null;

const idValido = (id: number) => Number.isInteger(id) && id > 0;

function refrescar() {
  revalidatePath("/pocket-qf");
  revalidatePath("/pocket-qf/[id]", "page");
}

function leerFicha(formData: FormData) {
  return esquemaFicha.safeParse({
    principioActivo: formData.get("principioActivo") ?? "",
    terminos: formData.get("terminos") ?? "",
    indicaciones: formData.get("indicaciones") ?? "",
    efectosSecundarios: formData.get("efectosSecundarios") ?? "",
    observaciones: formData.get("observaciones") ?? "",
  });
}

const yaExiste = (principio: string) => ({
  ok: false,
  mensaje: `Ya existe una ficha de ${principio}`,
  errores: { principioActivo: [`Ya existe una ficha de ${principio}`] },
});

export async function crearFichaAccion(
  _estadoAnterior: EstadoFicha, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoFicha> {
  const r = leerFicha(formData);
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }
  if (existeFichaConPrincipio(r.data.principioActivo)) {
    return yaExiste(r.data.principioActivo);
  }

  const ficha = insertarFicha(r.data);
  refrescar();
  redirect(`/pocket-qf/${ficha.id}`);
}

export async function editarFichaAccion(
  _estadoAnterior: EstadoFicha, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoFicha> {
  const id = Number(formData.get("id"));
  if (!idValido(id)) return { ok: false, mensaje: "Ficha no válida" };
  const r = leerFicha(formData);
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }
  if (existeFichaConPrincipio(r.data.principioActivo, id)) {
    return yaExiste(r.data.principioActivo);
  }

  const editada = actualizarFicha(id, r.data);
  if (!editada) return { ok: false, mensaje: "La ficha ya no existe" };
  refrescar();
  return { ok: true, mensaje: "Ficha guardada" };
}

export async function borrarFicha(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Ficha no válida" };
  const borrada = eliminarFicha(id);
  if (!borrada) return { ok: false, mensaje: "La ficha ya no existe" };
  refrescar();
  return { ok: true, mensaje: `Ficha de ${borrada.principioActivo} eliminada` };
}

export async function vincularProductoAccion(
  fichaId: number,
  productoId: number,
): Promise<Resultado> {
  if (
    !idValido(fichaId) ||
    !idValido(productoId) ||
    !existeProducto(productoId)
  ) {
    return { ok: false, mensaje: "Producto no válido" };
  }
  try {
    vincularProducto(fichaId, productoId);
  } catch {
    return { ok: false, mensaje: "La ficha ya no existe" }; // falla la FK
  }
  refrescar();
  return { ok: true, mensaje: "Producto asociado a la ficha" };
}

export async function desvincularProductoAccion(
  fichaId: number,
  productoId: number,
): Promise<Resultado> {
  if (!idValido(fichaId) || !idValido(productoId)) {
    return { ok: false, mensaje: "Producto no válido" };
  }
  const quitado = desvincularProducto(fichaId, productoId);
  if (!quitado)
    return { ok: false, mensaje: "El producto ya no estaba asociado" };
  refrescar();
  return { ok: true, mensaje: "Producto quitado de la ficha" };
}

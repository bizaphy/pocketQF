"use server";
// acciones del mapa de ubicaciones: zonas, muebles (estantes, vitrinas...) y sus repisas
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  esquemaEstante,
  esquemaRect,
  esquemaRepisa,
  esquemaTipoMueble,
  esquemaZona,
} from "@/lib/esquemas";
import {
  actualizarEstante,
  actualizarRepisa,
  eliminarEstante,
  eliminarRepisa,
  eliminarZona,
  existeRepisa,
  existeZonaConNombre,
  insertarEstante,
  insertarRepisa,
  insertarZona,
  moverEstante,
} from "@/lib/ubicaciones";

type Resultado = { ok: boolean; mensaje: string };

export type EstadoFormularioUbicacion = {
  ok: boolean;
  mensaje: string;
  errores?: Record<string, string[] | undefined>;
} | null;

const idValido = (id: number) => Number.isInteger(id) && id > 0;

// el mapa y la ficha de cada mueble muestran los mismos datos
function refrescar() {
  revalidatePath("/ubicaciones");
  revalidatePath("/ubicaciones/[id]", "page");
}

export async function crearZonaAccion(
  _estadoAnterior: EstadoFormularioUbicacion, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoFormularioUbicacion> {
  const r = esquemaZona.safeParse({ nombre: formData.get("nombre") });
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa el nombre",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }
  if (existeZonaConNombre(r.data.nombre)) {
    return {
      ok: false,
      mensaje: "Ya existe una zona con ese nombre",
      errores: { nombre: ["Ya existe una zona con ese nombre"] },
    };
  }

  const zona = insertarZona(r.data.nombre);
  refrescar();
  redirect(`/ubicaciones?zona=${zona.id}&editar=1`);
}

export async function borrarZona(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Zona no válida" };
  const borrada = eliminarZona(id);
  if (!borrada) return { ok: false, mensaje: "La zona ya no existe" };
  refrescar();
  return { ok: true, mensaje: `Zona "${borrada.nombre}" eliminada` };
}

export async function agregarEstante(zonaId: number, tipo: string) {
  const t = esquemaTipoMueble.safeParse(tipo);
  if (!idValido(zonaId) || !t.success) {
    return { ok: false as const, mensaje: "Datos no válidos" };
  }
  const r = insertarEstante(zonaId, t.data);
  if (r.ok) refrescar();
  return r;
}

export async function guardarPosicion(
  id: number,
  rect: unknown,
): Promise<Resultado> {
  const r = esquemaRect.safeParse(rect);
  if (!idValido(id) || !r.success) {
    return { ok: false, mensaje: "Posición no válida" };
  }
  const movido = moverEstante(id, r.data);
  if (!movido.ok) return movido;
  refrescar();
  return { ok: true, mensaje: "Posición guardada" };
}

export async function editarEstanteAccion(
  _estadoAnterior: EstadoFormularioUbicacion, // lo exige useActionState; no se usa
  formData: FormData,
): Promise<EstadoFormularioUbicacion> {
  const r = esquemaEstante.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    detalle: formData.get("detalle") ?? "",
    tipo: formData.get("tipo"),
  });
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }

  const { id, ...datos } = r.data;
  const editado = actualizarEstante(id, datos);
  if (!editado) return { ok: false, mensaje: "El mueble ya no existe" };
  refrescar();
  return { ok: true, mensaje: "Datos guardados" };
}

export async function borrarEstante(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Mueble no válido" };
  const borrado = eliminarEstante(id);
  if (!borrado) return { ok: false, mensaje: "El mueble ya no existe" };
  refrescar();
  return { ok: true, mensaje: `${borrado.nombre} eliminado` };
}

// crea (sin id) o edita (con id) una repisa
export async function guardarRepisa(datos: {
  estanteId: number;
  id?: number;
  numero: string;
  contenido: string;
}): Promise<EstadoFormularioUbicacion> {
  if (
    !idValido(datos.estanteId) ||
    (datos.id !== undefined && !idValido(datos.id))
  ) {
    return { ok: false, mensaje: "Repisa no válida" };
  }
  const r = esquemaRepisa.safeParse(datos);
  if (!r.success) {
    return {
      ok: false,
      mensaje: "Revisa la repisa",
      errores: z.flattenError(r.error).fieldErrors,
    };
  }
  if (existeRepisa(datos.estanteId, r.data.numero, datos.id)) {
    return {
      ok: false,
      mensaje: `Ya existe la repisa ${r.data.numero}`,
      errores: { numero: [`Ya existe la repisa ${r.data.numero}`] },
    };
  }

  const guardada =
    datos.id === undefined
      ? insertarRepisa({ estanteId: datos.estanteId, ...r.data })
      : actualizarRepisa(datos.id, r.data);
  if (!guardada) return { ok: false, mensaje: "La repisa ya no existe" };

  refrescar();
  return { ok: true, mensaje: `Repisa ${guardada.numero} guardada` };
}

export async function borrarRepisa(id: number): Promise<Resultado> {
  if (!idValido(id)) return { ok: false, mensaje: "Repisa no válida" };
  const borrada = eliminarRepisa(id);
  if (!borrada) return { ok: false, mensaje: "La repisa ya no existe" };
  refrescar();
  return { ok: true, mensaje: `Repisa ${borrada.numero} eliminada` };
}

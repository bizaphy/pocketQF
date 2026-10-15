// Consultas de ubicaciones: zonas, muebles del mapa y repisas con su contenido.
// Las reglas de posición (bordes y choques) viven en mapa.ts y se vuelven a revisar aquí,
// dentro de la transacción, para no confiar en lo que mande el navegador.

import { connection } from "next/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { estantes, repisas, zonas } from "@/db/schema";
import {
  TAMANO_INICIAL,
  TIPOS,
  buscarHueco,
  posicionLibre,
  type Rect,
  type TipoMueble,
} from "@/lib/mapa";

export async function obtenerZonas() {
  await connection();
  return db
    .select()
    .from(zonas)
    .orderBy(asc(zonas.creadaEn), asc(zonas.id))
    .all();
}

// muebles de una zona, cada uno con sus repisas ordenadas
export async function obtenerMapa(zonaId: number) {
  await connection();
  const muebles = db
    .select()
    .from(estantes)
    .where(eq(estantes.zonaId, zonaId))
    .orderBy(asc(estantes.id))
    .all();
  const filas = db
    .select({
      id: repisas.id,
      estanteId: repisas.estanteId,
      numero: repisas.numero,
      contenido: repisas.contenido,
    })
    .from(repisas)
    .innerJoin(estantes, eq(repisas.estanteId, estantes.id))
    .where(eq(estantes.zonaId, zonaId))
    .orderBy(asc(repisas.numero))
    .all();

  return muebles.map((m) => ({
    ...m,
    repisas: filas.filter((r) => r.estanteId === m.id),
  }));
}

export async function obtenerEstante(id: number) {
  await connection();
  const fila = db
    .select({ estante: estantes, zona: zonas })
    .from(estantes)
    .innerJoin(zonas, eq(estantes.zonaId, zonas.id))
    .where(eq(estantes.id, id))
    .get();
  if (!fila) return undefined;

  const lista = db
    .select()
    .from(repisas)
    .where(eq(repisas.estanteId, id))
    .orderBy(asc(repisas.numero))
    .all();

  return { ...fila.estante, zona: fila.zona, repisas: lista };
}

export function existeZonaConNombre(nombre: string, salvoId?: number) {
  return !!db
    .select({ id: zonas.id })
    .from(zonas)
    .where(
      and(
        eq(zonas.nombre, nombre),
        salvoId ? ne(zonas.id, salvoId) : undefined,
      ),
    )
    .get();
}

export function insertarZona(nombre: string) {
  return db.insert(zonas).values({ nombre }).returning().get();
}

export function eliminarZona(id: number) {
  // borra en cascada sus muebles y repisas (FK con onDelete: "cascade")
  return db.delete(zonas).where(eq(zonas.id, id)).returning().get();
}

// crea el mueble en el primer hueco libre y le pone nombre correlativo ("Estante 3")
export function insertarEstante(zonaId: number, tipo: TipoMueble) {
  return db.transaction((tx) => {
    const zona = tx.select().from(zonas).where(eq(zonas.id, zonaId)).get();
    if (!zona) return { ok: false as const, mensaje: "La zona no existe" };

    const otros = tx
      .select()
      .from(estantes)
      .where(eq(estantes.zonaId, zonaId))
      .all();
    const { ancho, alto } = TAMANO_INICIAL[tipo];
    const hueco = buscarHueco(ancho, alto, otros);
    if (!hueco) {
      return {
        ok: false as const,
        mensaje: "No queda espacio libre en el mapa para este mueble",
      };
    }

    // siguiente número libre entre los del mismo tipo
    const nombres = new Set(otros.map((o) => o.nombre));
    let n = otros.filter((o) => o.tipo === tipo).length + 1;
    while (nombres.has(`${TIPOS[tipo]} ${n}`)) n++;

    const estante = tx
      .insert(estantes)
      .values({
        zonaId,
        tipo,
        nombre: `${TIPOS[tipo]} ${n}`,
        ...hueco,
        ancho,
        alto,
      })
      .returning()
      .get();
    return { ok: true as const, estante: { ...estante, repisas: [] } };
  });
}

// mueve, redimensiona o rota: solo si queda dentro del mapa y sin pisar a otro mueble
export function moverEstante(id: number, rect: Rect) {
  return db.transaction((tx) => {
    const estante = tx.select().from(estantes).where(eq(estantes.id, id)).get();
    if (!estante)
      return { ok: false as const, mensaje: "El mueble ya no existe" };

    const otros = tx
      .select()
      .from(estantes)
      .where(eq(estantes.zonaId, estante.zonaId))
      .all();
    if (!posicionLibre(rect, otros, id)) {
      return {
        ok: false as const,
        mensaje: "Ahí no cabe: se sale del mapa o pisa otro mueble",
      };
    }

    tx.update(estantes).set(rect).where(eq(estantes.id, id)).run();
    return { ok: true as const };
  });
}

export function actualizarEstante(
  id: number,
  datos: { nombre: string; detalle: string | null; tipo: TipoMueble },
) {
  return db
    .update(estantes)
    .set(datos)
    .where(eq(estantes.id, id))
    .returning()
    .get();
}

export function eliminarEstante(id: number) {
  // sus repisas se borran en cascada
  return db.delete(estantes).where(eq(estantes.id, id)).returning().get();
}

export function existeRepisa(
  estanteId: number,
  numero: number,
  salvoId?: number,
) {
  return !!db
    .select({ id: repisas.id })
    .from(repisas)
    .where(
      and(
        eq(repisas.estanteId, estanteId),
        eq(repisas.numero, numero),
        salvoId ? ne(repisas.id, salvoId) : undefined,
      ),
    )
    .get();
}

export function insertarRepisa(datos: {
  estanteId: number;
  numero: number;
  contenido: string;
}) {
  return db.insert(repisas).values(datos).returning().get();
}

export function actualizarRepisa(
  id: number,
  datos: { numero: number; contenido: string },
) {
  return db
    .update(repisas)
    .set(datos)
    .where(eq(repisas.id, id))
    .returning()
    .get();
}

export function eliminarRepisa(id: number) {
  return db.delete(repisas).where(eq(repisas.id, id)).returning().get();
}

// Consultas de Pocket QF: fichas por principio activo y productos asociados a mano.
// El cruce por nombre con los productos se hace en pocket-qf.ts.

import { connection } from "next/server";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { fichaProductos, fichas } from "@/db/schema";
import type { DatosFicha } from "@/lib/esquemas";

// todas las fichas, cada una con los ids de sus productos asociados a mano
export async function obtenerFichas() {
  await connection();
  const lista = db
    .select()
    .from(fichas)
    .orderBy(asc(sql`${fichas.principioActivo} collate nocase`))
    .all();
  const vinculos = db.select().from(fichaProductos).all();
  return lista.map((f) => ({
    ...f,
    productoIds: vinculos
      .filter((v) => v.fichaId === f.id)
      .map((v) => v.productoId),
  }));
}

export async function obtenerFicha(id: number) {
  await connection();
  const ficha = db.select().from(fichas).where(eq(fichas.id, id)).get();
  if (!ficha) return undefined;
  const vinculos = db
    .select({ productoId: fichaProductos.productoId })
    .from(fichaProductos)
    .where(eq(fichaProductos.fichaId, id))
    .all();
  return { ...ficha, productoIds: vinculos.map((v) => v.productoId) };
}

// "paracetamol" y "Paracetamol" son la misma ficha
export function existeFichaConPrincipio(principio: string, salvoId?: number) {
  return !!db
    .select({ id: fichas.id })
    .from(fichas)
    .where(
      and(
        sql`${fichas.principioActivo} = ${principio} collate nocase`,
        salvoId ? ne(fichas.id, salvoId) : undefined,
      ),
    )
    .get();
}

export function insertarFicha(datos: DatosFicha) {
  return db.insert(fichas).values(datos).returning().get();
}

export function actualizarFicha(id: number, datos: DatosFicha) {
  return db
    .update(fichas)
    .set(datos)
    .where(eq(fichas.id, id))
    .returning()
    .get();
}

export function eliminarFicha(id: number) {
  // borra en cascada sus productos asociados a mano (FK con onDelete: "cascade")
  return db.delete(fichas).where(eq(fichas.id, id)).returning().get();
}

export function vincularProducto(fichaId: number, productoId: number) {
  return db
    .insert(fichaProductos)
    .values({ fichaId, productoId })
    .onConflictDoNothing() // ya estaba asociado
    .run();
}

export function desvincularProducto(fichaId: number, productoId: number) {
  return db
    .delete(fichaProductos)
    .where(
      and(
        eq(fichaProductos.fichaId, fichaId),
        eq(fichaProductos.productoId, productoId),
      ),
    )
    .returning()
    .get();
}

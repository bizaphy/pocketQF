// Consultas del inventario del día: elegir productos para contar, guardar lo contado y ver el historial.
// Un producto cuenta como "inventariado" cuando se registra su conteo (contadoEn), no cuando sale en una lista:
// así, un inventario generado y abandonado no bloquea esos productos.

import { connection } from "next/server";
import { subDays } from "date-fns";
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gt,
  gte,
  isNull,
  notExists,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { inventarioItems, inventarios, productos } from "@/db/schema";
import type { DatosGenerarInventario } from "@/lib/esquemas";

// categorías con productos activos, para el selector del formulario
export async function obtenerCategorias() {
  await connection();
  return db
    .select({ categoria: productos.categoria, productos: count() })
    .from(productos)
    .where(
      and(eq(productos.activo, true), sql`${productos.categoria} is not null`),
    )
    .groupBy(productos.categoria)
    .orderBy(asc(productos.categoria))
    .all()
    .map((c) => ({ categoria: c.categoria!, productos: c.productos }));
}

// Elige al azar los productos a contar y crea el inventario. Quedan fuera:
// - los inactivos (ya no vienen en el Excel)
// - los de otra categoría (en modo "categoria")
// - los con stock 0, salvo que se pida incluirlos
// - los contados en los últimos `diasSinRepetir` días
export function generarInventario(datos: DatosGenerarInventario) {
  const desde = subDays(new Date(), datos.diasSinRepetir);

  const filtros = and(
    eq(productos.activo, true),
    datos.modo === "categoria"
      ? eq(productos.categoria, datos.categoria!)
      : undefined,
    datos.incluirSinStock ? undefined : gt(productos.stock, 0),
  );

  // conteos recientes de cada producto (para excluirlos)
  const contadoHacePoco = db
    .select({ id: inventarioItems.id })
    .from(inventarioItems)
    .where(
      and(
        eq(inventarioItems.productoId, productos.id),
        gte(inventarioItems.contadoEn, desde),
      ),
    );

  return db.transaction((tx) => {
    const elegidos = tx
      .select({ id: productos.id, stock: productos.stock })
      .from(productos)
      .where(
        and(
          filtros,
          datos.diasSinRepetir > 0 ? notExists(contadoHacePoco) : undefined,
        ),
      )
      .orderBy(sql`random()`)
      .limit(datos.cantidad)
      .all();

    // para informar: cuántos cumplían los filtros y cuántos se saltaron por haberse contado hace poco
    const total = tx
      .select({ n: count() })
      .from(productos)
      .where(filtros)
      .get()!.n;
    const recientes =
      datos.diasSinRepetir > 0
        ? tx
            .select({ n: count() })
            .from(productos)
            .where(and(filtros, exists(contadoHacePoco)))
            .get()!.n
        : 0;

    if (elegidos.length === 0) {
      return { ok: false as const, total, recientes };
    }

    const inventario = tx
      .insert(inventarios)
      .values({
        modo: datos.modo,
        categoria: datos.modo === "categoria" ? datos.categoria : null,
      })
      .returning()
      .get();

    tx.insert(inventarioItems)
      .values(
        elegidos.map((p) => ({
          inventarioId: inventario.id,
          productoId: p.id,
          stockSistema: p.stock,
        })),
      )
      .run();

    return {
      ok: true as const,
      id: inventario.id,
      elegidos: elegidos.length,
      faltaron: elegidos.length < datos.cantidad, // no alcanzaron los productos para la cantidad pedida
      recientes,
    };
  });
}

// historial: cada inventario con su avance y cuántas diferencias encontró
export async function obtenerInventarios() {
  await connection();
  return db
    .select({
      id: inventarios.id,
      modo: inventarios.modo,
      categoria: inventarios.categoria,
      creadoEn: inventarios.creadoEn,
      finalizadoEn: inventarios.finalizadoEn,
      total: count(inventarioItems.id),
      contados: sql<number>`count(${inventarioItems.contado})`, // count(col) no cuenta los null
      diferencias: sql<number>`coalesce(sum(${inventarioItems.contado} is not null and ${inventarioItems.contado} != ${inventarioItems.stockSistema}), 0)`,
    })
    .from(inventarios)
    .leftJoin(inventarioItems, eq(inventarioItems.inventarioId, inventarios.id))
    .groupBy(inventarios.id)
    .orderBy(desc(inventarios.creadoEn), desc(inventarios.id))
    .all();
}

export async function obtenerInventario(id: number) {
  await connection();
  const inventario = db
    .select()
    .from(inventarios)
    .where(eq(inventarios.id, id))
    .get();
  if (!inventario) return undefined;

  const items = db
    .select({
      id: inventarioItems.id,
      sku: productos.sku,
      nombre: productos.nombre,
      categoria: productos.categoria,
      stockSistema: inventarioItems.stockSistema,
      contado: inventarioItems.contado,
    })
    .from(inventarioItems)
    .innerJoin(productos, eq(inventarioItems.productoId, productos.id))
    .where(eq(inventarioItems.inventarioId, id))
    .orderBy(asc(productos.categoria), asc(productos.nombre))
    .all();

  return { ...inventario, items };
}

// Guarda lo contado (null = sin contar) y, si se pide, cierra el inventario.
// contadoEn solo cambia si cambió el número: volver a guardar no "renueva" un conteo viejo.
export function guardarConteos(
  inventarioId: number,
  conteos: { itemId: number; contado: number | null }[],
  finalizar: boolean,
) {
  return db.transaction((tx) => {
    const inventario = tx
      .select()
      .from(inventarios)
      .where(eq(inventarios.id, inventarioId))
      .get();
    if (!inventario)
      return { ok: false as const, mensaje: "El inventario no existe" };
    if (inventario.finalizadoEn) {
      return {
        ok: false as const,
        mensaje: "El inventario ya está finalizado",
      };
    }

    const ahora = new Date();
    for (const { itemId, contado } of conteos) {
      tx.update(inventarioItems)
        .set({ contado, contadoEn: contado === null ? null : ahora })
        .where(
          and(
            eq(inventarioItems.id, itemId),
            eq(inventarioItems.inventarioId, inventarioId), // solo items de este inventario
            // sin cambios no se toca la fila
            contado === null
              ? sql`${inventarioItems.contado} is not null`
              : sql`${inventarioItems.contado} is not ${contado}`,
          ),
        )
        .run();
    }

    if (finalizar) {
      tx.update(inventarios)
        .set({ finalizadoEn: ahora })
        .where(eq(inventarios.id, inventarioId))
        .run();
    }

    const pendientes = tx
      .select({ n: count() })
      .from(inventarioItems)
      .where(
        and(
          eq(inventarioItems.inventarioId, inventarioId),
          isNull(inventarioItems.contado),
        ),
      )
      .get()!.n;

    return { ok: true as const, pendientes };
  });
}

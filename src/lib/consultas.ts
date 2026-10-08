import { connection } from "next/server";
import { db } from "@/db";
import { productos, vencimientos } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import type { DatosVencimiento } from "@/lib/esquemas";

// para el buscador: solo productos activos (no tiene sentido ingresar un producto que ya no se compra)
export async function obtenerProductosActivos() {
  await connection();
  return db
    .select({ id: productos.id, sku: productos.sku, nombre: productos.nombre })
    .from(productos)
    .where(eq(productos.activo, true))
    .orderBy(asc(productos.nombre))
    .all();
}

export function existeProducto(id: number): boolean {
  const fila = db
    .select({ id: productos.id })
    .from(productos)
    .where(and(eq(productos.id, id), eq(productos.activo, true)))
    .get(); // .get(): la primera fila o undefined
  return fila !== undefined;
}

export function insertarVencimiento(datos: DatosVencimiento) {
  return db.insert(vencimientos).values(datos).returning().get();
}

export async function obtenerVencimientos() {
  await connection(); //debido a que sql-lite es sincrono (lectura local directa)

  return (
    db
      .select({
        id: vencimientos.id,
        sku: productos.sku,
        nombre: productos.nombre,
        lote: vencimientos.lote,
        fechaVencimiento: vencimientos.fechaVencimiento,
        cantidad: vencimientos.cantidad,
        ultimaRevision: vencimientos.ultimaRevision,
      })
      .from(vencimientos)
      //a cada lote, se le une exclusiv. el producto cuyo id sea igual al productoId del lote
      .innerJoin(productos, eq(vencimientos.productoId, productos.id))
      .orderBy(asc(vencimientos.fechaVencimiento))
      .all() //ejec.
  );
}

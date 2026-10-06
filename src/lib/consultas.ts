import { connection } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productos, vencimientos } from "@/db/schema";

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

import { connection } from "next/server";
import { db } from "@/db";
import { importaciones, notas, productos, vencimientos } from "@/db/schema";
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import type { FilaProducto } from "@/lib/importar-productos";
import type {
  DatosEdicionVencimiento,
  DatosNota,
  DatosVencimiento,
} from "@/lib/esquemas";

// para el buscador: solo productos activos (no tiene sentido ingresar un producto que ya no se compra)
export async function obtenerProductosActivos() {
  await connection();
  return db
    .select({
      id: productos.id,
      sku: productos.sku,
      nombre: productos.nombre,
      stock: productos.stock,
      categoria: productos.categoria,
    })
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

// devuelve la fila editada, o undefined si el id no existía
export function actualizarVencimiento({
  id,
  ...datos
}: DatosEdicionVencimiento) {
  return (
    db
      .update(vencimientos)
      // ultimaRevision explícita: queda registro aunque no cambie ningún dato (se revisó igual)
      .set({ ...datos, ultimaRevision: new Date() })
      .where(eq(vencimientos.id, id))
      .returning()
      .get()
  );
}

// devuelve la fila borrada, o undefined si el id no existía
export function eliminarVencimiento(id: number) {
  return db
    .delete(vencimientos)
    .where(eq(vencimientos.id, id))
    .returning()
    .get();
}

export async function obtenerVencimientos() {
  await connection(); //debido a que sql-lite es sincrono (lectura local directa)

  return (
    db
      .select({
        id: vencimientos.id,
        sku: productos.sku,
        nombre: productos.nombre,
        categoria: productos.categoria,
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

// notas del post-it: la más reciente primero
export async function obtenerNotas() {
  await connection();
  return db
    .select()
    .from(notas)
    .orderBy(desc(notas.creadaEn), desc(notas.id))
    .all();
}

export function insertarNota(datos: DatosNota) {
  return db.insert(notas).values(datos).returning().get();
}

// Reemplaza la base de productos con lo que trae el Excel semanal, todo en una transacción:
// - los productos del Excel se crean o se actualizan (nombre, stock, categoría) y quedan activos
// - los que ya no vienen en el Excel se desactivan (no se borran: pueden tener vencimientos asociados)
export function reemplazarBaseProductos(
  filas: FilaProducto[],
  archivo: string,
) {
  return db.transaction((tx) => {
    const antes = tx
      .select({ sku: productos.sku, activo: productos.activo })
      .from(productos)
      .all();
    const existentes = new Set(antes.map((p) => p.sku));
    const enExcel = new Set(filas.map((f) => f.codigoBarra));

    const nuevos = filas.filter((f) => !existentes.has(f.codigoBarra)).length;
    const desactivados = antes.filter(
      (p) => p.activo && !enExcel.has(p.sku),
    ).length;

    // 1. todos inactivos; el upsert de abajo reactiva los que vienen en el Excel
    tx.update(productos).set({ activo: false }).run();

    // 2. upsert por código de barra, en tandas (SQLite limita la cantidad de parámetros por consulta)
    const TANDA = 500;
    for (let i = 0; i < filas.length; i += TANDA) {
      tx.insert(productos)
        .values(
          filas.slice(i, i + TANDA).map((f) => ({
            sku: f.codigoBarra,
            nombre: f.nombre,
            stock: f.stock,
            categoria: f.categoria,
            activo: true,
          })),
        )
        .onConflictDoUpdate({
          target: productos.sku,
          // excluded.x: el valor que se intentó insertar
          set: {
            nombre: sql`excluded.nombre`,
            stock: sql`excluded.stock`,
            categoria: sql`excluded.categoria`,
            activo: true,
          },
        })
        .run();
    }

    // 3. dejar registro de la importación
    return tx
      .insert(importaciones)
      .values({
        archivo,
        total: filas.length,
        nuevos,
        actualizados: filas.length - nuevos,
        desactivados,
      })
      .returning()
      .get();
  });
}

export async function obtenerUltimaImportacion() {
  await connection();
  return db
    .select()
    .from(importaciones)
    .orderBy(desc(importaciones.creadaEn), desc(importaciones.id))
    .get();
}

// productos activos por categoría, de la que tiene más a la que tiene menos
// incluirSinStock: false deja fuera los que tienen stock 0 según el último Excel
export async function contarProductosPorCategoria(incluirSinStock: boolean) {
  await connection();
  return db
    .select({
      categoria: productos.categoria,
      productos: count(),
      stock: sql<number>`coalesce(sum(${productos.stock}), 0)`,
    })
    .from(productos)
    .where(
      and(
        eq(productos.activo, true),
        incluirSinStock ? undefined : gt(productos.stock, 0), // undefined: and() lo ignora
      ),
    )
    .groupBy(productos.categoria)
    .orderBy(desc(count()))
    .all();
}

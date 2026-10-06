// Seed: vacía las tablas y las llena con datos de prueba (3 productos, 4 lotes).
// Ejecutar con `npm run db:seed`.

import "dotenv/config";
import { db } from "@/db";
import { productos, vencimientos } from "@/db/schema";

db.delete(vencimientos).run(); //elimina hijos (.run ejecuta solo esta consulta, sin devolver filas)
db.delete(productos).run(); //elimina padres.

//se necesitan los ids generados por SQLite para crear los vencimientos
const insertados = db
  .insert(productos)
  .values([
    { sku: "FAR-001", nombre: "Producto 1" },
    { sku: "FAR-002", nombre: "Producto 2" },
    { sku: "FAR-003", nombre: "Producto 3" },
  ])
  .returning() //agrega RETURNING *: el insert devuelve las filas (sin esto .all() falla)
  // devuelve las filas insertadas, con el `id` que les asignó la BD.
  .all(); //ejecuta y entrega esas filas en un arreglo

const [p1, p2, p3] = insertados; //cada uno trae su id real

db.insert(vencimientos)
  .values([
    {
      productoId: p1.id,
      lote: "L100",
      fechaVencimiento: "2026-10-02",
      cantidad: 24,
    },
    {
      productoId: p1.id,
      lote: "L215",
      fechaVencimiento: "2027-03-15",
      cantidad: 10,
    }, // mismo producto, otro lote
    {
      productoId: p2.id,
      lote: "A7",
      fechaVencimiento: "2026-09-27",
      cantidad: 6,
    },
    {
      productoId: p3.id,
      lote: "X3",
      fechaVencimiento: "2026-11-25",
      cantidad: 12,
    },
  ])
  .run(); //no se necesitan las filas de vuelta: basta con run

console.log("Seed listo");

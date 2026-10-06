import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productos = sqliteTable("productos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(),
  nombre: text("nombre").notNull(),
  laboratorio: text("laboratorio"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
});

export const vencimientos = sqliteTable(
  "vencimientos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    lote: text("lote").notNull(),
    fechaVencimiento: text("fecha_vencimiento").notNull(), // ISO: "YYYY-MM-DD"
    cantidad: integer("cantidad").notNull(),
    ultimaRevision: integer("ultima_revision", { mode: "timestamp" }) // guarda epoch en segundos, Drizzle lo convierte a Date
      .notNull()
      .$defaultFn(() => new Date()) // al insertar, si no se pasa valor
      .$onUpdate(() => new Date()), // al hacer update, se actualiza solo
  },
  (t) => [
    //3er argumento: indices
    index("idx_vencimientos_fecha").on(t.fechaVencimiento),
    index("idx_vencimientos_producto").on(t.productoId),
  ],
);

export type Producto = typeof productos.$inferSelect;
export type Vencimiento = typeof vencimientos.$inferSelect;

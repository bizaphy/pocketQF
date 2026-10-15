import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const productos = sqliteTable("productos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(), // código de barra (en pantalla se muestra así)
  nombre: text("nombre").notNull(),
  laboratorio: text("laboratorio"),
  stock: integer("stock").notNull().default(0),
  categoria: text("categoria"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true), // false: ya no viene en el Excel semanal
});

// registro de cada Excel de productos subido (uno por semana)
export const importaciones = sqliteTable("importaciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  archivo: text("archivo").notNull(),
  total: integer("total").notNull(), // filas leídas del Excel
  nuevos: integer("nuevos").notNull(),
  actualizados: integer("actualizados").notNull(),
  desactivados: integer("desactivados").notNull(), // estaban en la BD pero no en el Excel
  creadaEn: integer("creada_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
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

// notas del post-it del inicio
export const notas = sqliteTable("notas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contenido: text("contenido").notNull(),
  autor: text("autor").notNull(),
  creadaEn: integer("creada_en", { mode: "timestamp" }) // momento exacto en que se escribió
    .notNull()
    .$defaultFn(() => new Date()),
});

// inventario del día: una lista de productos elegidos para contar
export const inventarios = sqliteTable("inventarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modo: text("modo", { enum: ["azar", "categoria"] }).notNull(),
  categoria: text("categoria"), // solo en modo "categoria"
  creadoEn: integer("creado_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  finalizadoEn: integer("finalizado_en", { mode: "timestamp" }), // null: todavía se está contando
});

// cada producto de un inventario, con lo que decía el sistema y lo que se contó
export const inventarioItems = sqliteTable(
  "inventario_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    inventarioId: integer("inventario_id")
      .notNull()
      .references(() => inventarios.id, { onDelete: "cascade" }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    stockSistema: integer("stock_sistema").notNull(), // foto del stock al generar el inventario
    contado: integer("contado"), // null: aún no se cuenta
    contadoEn: integer("contado_en", { mode: "timestamp" }), // sirve para no repetir productos contados hace poco
  },
  (t) => [
    index("idx_items_inventario").on(t.inventarioId),
    index("idx_items_producto_contado").on(t.productoId, t.contadoEn),
  ],
);

// ubicaciones: cada zona de la farmacia (sala de ventas, bodega...) tiene su propio mapa
export const zonas = sqliteTable("zonas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  creadaEn: integer("creada_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// mueble dibujado en el mapa de una zona. x, y, ancho y alto van en celdas de la cuadrícula
export const estantes = sqliteTable(
  "estantes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    zonaId: integer("zona_id")
      .notNull()
      .references(() => zonas.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(), // ej: "Estante 1"
    detalle: text("detalle"), // ej: "sala" → "Estante 1 (sala)"
    tipo: text("tipo", {
      enum: ["estante", "vitrina", "refrigerador", "meson"],
    })
      .notNull()
      .default("estante"),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    ancho: integer("ancho").notNull(),
    alto: integer("alto").notNull(),
  },
  (t) => [index("idx_estantes_zona").on(t.zonaId)],
);

// cada repisa de un estante y lo que se guarda en ella (ej: "Oftálmicos")
export const repisas = sqliteTable(
  "repisas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    estanteId: integer("estante_id")
      .notNull()
      .references(() => estantes.id, { onDelete: "cascade" }),
    numero: integer("numero").notNull(),
    contenido: text("contenido").notNull(),
  },
  // dos repisas del mismo estante no pueden tener el mismo número
  (t) => [uniqueIndex("uq_repisas_estante_numero").on(t.estanteId, t.numero)],
);

export type Producto = typeof productos.$inferSelect;
export type Vencimiento = typeof vencimientos.$inferSelect;
export type Nota = typeof notas.$inferSelect;
export type Importacion = typeof importaciones.$inferSelect;
export type Inventario = typeof inventarios.$inferSelect;
export type Zona = typeof zonas.$inferSelect;
export type Estante = typeof estantes.$inferSelect;
export type Repisa = typeof repisas.$inferSelect;

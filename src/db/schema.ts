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

// cada edición de una nota: quién la editó, cuándo y cómo decía antes
export const notaEdiciones = sqliteTable(
  "nota_ediciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    notaId: integer("nota_id")
      .notNull()
      .references(() => notas.id, { onDelete: "cascade" }),
    editor: text("editor").notNull(),
    contenidoAnterior: text("contenido_anterior").notNull(),
    editadaEn: integer("editada_en", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("idx_ediciones_nota").on(t.notaId)],
);

// inventario del día: una lista de productos elegidos para contar
export const inventarios = sqliteTable("inventarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // controlados: todos los de la categoría "Controlado", que el inventario del día excluye
  modo: text("modo", { enum: ["azar", "categoria", "controlados"] }).notNull(),
  categoria: text("categoria"), // solo en modo "categoria" (y "Controlado" en modo "controlados")
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

// tareas pendientes del equipo.
// periódica: se repite (ej: 2 veces por semana) y se marca hecha cada vez en tareaRegistros.
// fortuita: se hace una sola vez (ej: enviar devolución al proveedor X) y queda con completadaEn.
export const tareas = sqliteTable("tareas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo", { enum: ["periodica", "fortuita"] }).notNull(),
  titulo: text("titulo").notNull(),
  detalle: text("detalle"), // ej: "Proveedor X - Paracetamol lote L100"
  veces: integer("veces"), // solo periódicas: cuántas veces por periodo
  periodo: text("periodo", { enum: ["dia", "semana", "mes"] }), // solo periódicas
  fechaLimite: text("fecha_limite"), // solo fortuitas, opcional. ISO: "YYYY-MM-DD"
  completadaEn: integer("completada_en", { mode: "timestamp" }), // solo fortuitas. null: pendiente
  creadaEn: integer("creada_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// cada vez que se hizo una tarea periódica
export const tareaRegistros = sqliteTable(
  "tarea_registros",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tareaId: integer("tarea_id")
      .notNull()
      .references(() => tareas.id, { onDelete: "cascade" }),
    hechaEn: integer("hecha_en", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("idx_registros_tarea_fecha").on(t.tareaId, t.hechaEn)],
);

// Pocket QF: ficha de un principio activo con información de consulta rápida.
// Los productos se asocian solos si su nombre contiene el principio activo o uno de sus términos
// (el POS no trae el principio activo en una columna aparte); fichaProductos guarda las excepciones.
export const fichas = sqliteTable("fichas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  principioActivo: text("principio_activo").notNull().unique(), // ej: "Escitalopram"
  terminos: text("terminos"), // otros nombres para buscar en el nombre del producto, separados por coma
  indicaciones: text("indicaciones"), // diagnóstico o uso típico
  efectosSecundarios: text("efectos_secundarios"),
  observaciones: text("observaciones"), // precauciones y consejos para el paciente
  actualizadaEn: integer("actualizada_en", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// productos asociados a mano a una ficha (marcas cuyo nombre no trae el principio activo)
export const fichaProductos = sqliteTable(
  "ficha_productos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fichaId: integer("ficha_id")
      .notNull()
      .references(() => fichas.id, { onDelete: "cascade" }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
  },
  (t) => [uniqueIndex("uq_ficha_producto").on(t.fichaId, t.productoId)],
);

export type Producto = typeof productos.$inferSelect;
export type Vencimiento = typeof vencimientos.$inferSelect;
export type Nota = typeof notas.$inferSelect;
export type Importacion = typeof importaciones.$inferSelect;
export type Inventario = typeof inventarios.$inferSelect;
export type Zona = typeof zonas.$inferSelect;
export type Estante = typeof estantes.$inferSelect;
export type Repisa = typeof repisas.$inferSelect;
export type Tarea = typeof tareas.$inferSelect;
export type Ficha = typeof fichas.$inferSelect;

import { z } from "zod";

export const esquemaVencimiento = z.object({
  productoId: z.coerce
    .number({ error: "Elige un producto de la lista" })
    .int()
    .positive("Elige un producto de la lista"),
  lote: z.string().trim().min(1, "El lote es obligatorio"),
  fechaVencimiento: z.iso.date({ error: "La fecha no es válida" }),
  cantidad: z.coerce
    .number({ error: "La cantidad debe ser un número" })
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor que 0"),
});

export type DatosVencimiento = z.infer<typeof esquemaVencimiento>;

// al editar no se cambia el producto: solo lote, fecha y cantidad del lote
export const esquemaEdicionVencimiento = esquemaVencimiento
  .omit({ productoId: true })
  .extend({ id: z.coerce.number().int().positive() });

export type DatosEdicionVencimiento = z.infer<typeof esquemaEdicionVencimiento>;

export const esquemaNota = z.object({
  contenido: z
    .string()
    .trim()
    .min(1, "Escribe algo en la nota")
    .max(1000, "Máximo 1000 caracteres"),
  autor: z
    .string()
    .trim()
    .min(1, "Indica quién escribe")
    .max(60, "Máximo 60 caracteres"),
});

export type DatosNota = z.infer<typeof esquemaNota>;

export const esquemaGenerarInventario = z
  .object({
    modo: z.enum(["azar", "categoria"], {
      error: "Elige cómo generar el inventario",
    }),
    categoria: z.string().trim().optional(),
    cantidad: z.coerce
      .number({ error: "La cantidad debe ser un número" })
      .int("La cantidad debe ser un número entero")
      .min(1, "Al menos 1 producto")
      .max(200, "Máximo 200 productos"),
    diasSinRepetir: z.coerce
      .number({ error: "Los días deben ser un número" })
      .int("Los días deben ser un número entero")
      .min(0, "No puede ser negativo")
      .max(365, "Máximo 365 días"),
    incluirSinStock: z.boolean(),
  })
  // la categoría solo es obligatoria en modo "categoria"
  .refine((d) => d.modo !== "categoria" || !!d.categoria, {
    error: "Elige una categoría",
    path: ["categoria"],
  });

export type DatosGenerarInventario = z.infer<typeof esquemaGenerarInventario>;

// lo contado de un producto: vacío (aún no se cuenta) o un entero desde 0
export const esquemaConteo = z.union([
  z.literal("").transform(() => null),
  z.coerce
    .number({ error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
]);

// ubicaciones: zona del mapa (ej: "Sala de ventas")
export const esquemaZona = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la zona")
    .max(40, "Máximo 40 caracteres"),
});

export const esquemaTipoMueble = z.enum(
  ["estante", "vitrina", "refrigerador", "meson"],
  { error: "Tipo de mueble no válido" },
);

export const esquemaEstante = z.object({
  id: z.coerce.number().int().positive(),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(40, "Máximo 40 caracteres"),
  // vacío = sin detalle
  detalle: z
    .string()
    .trim()
    .max(40, "Máximo 40 caracteres")
    .transform((d) => d || null),
  tipo: esquemaTipoMueble,
});

export type DatosEstante = z.infer<typeof esquemaEstante>;

// posición y tamaño en celdas; que quepa en el mapa lo revisa mapa.ts
export const esquemaRect = z.object({
  x: z.number().int(),
  y: z.number().int(),
  ancho: z.number().int().min(1),
  alto: z.number().int().min(1),
});

export const esquemaRepisa = z.object({
  numero: z.coerce
    .number({ error: "El número debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Desde 1")
    .max(50, "Máximo 50"),
  contenido: z
    .string()
    .trim()
    .min(1, "Escribe qué hay en la repisa")
    .max(120, "Máximo 120 caracteres"),
});

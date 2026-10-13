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

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

//SRC/DATA
//PLACEHOLDER de productos, por ahora son falsos.

import type { Producto } from "@/types/producto";

export const productosPlaceHolder: Producto[] = [
  {
    sku: "FAR-001",
    nombre: "Producto 1",
    fechaVencimiento: "2026-10-02",
    cantidad: 24,
    ultimaRevision: "2026-09-29T10:15:00",
  },
  {
    sku: "FAR-002",
    nombre: "Producto 2",
    fechaVencimiento: "2026-09-27", //vencido
    cantidad: 6,
    ultimaRevision: "2026-09-25T16:40:00",
  },
  {
    sku: "FAR-003",
    nombre: "Producto 3",
    fechaVencimiento: "2026-10-20", //urgente (≤ 30 días)
    cantidad: 48,
    ultimaRevision: "2026-09-30T09:05:00",
  },
  {
    sku: "FAR-004",
    nombre: "Producto 4",
    fechaVencimiento: "2026-11-25", //pronto (≤ 90 días)
    cantidad: 12,
    ultimaRevision: "2026-09-28T12:30:00",
  },
  {
    sku: "FAR-005",
    nombre: "Producto 5",
    fechaVencimiento: "2027-03-15", //sin apuro
    cantidad: 100,
    ultimaRevision: "2026-09-20T18:00:00",
  },
  {
    sku: "FAR-006",
    nombre: "Producto 6",
    fechaVencimiento: "2027-08-01", //sin apuro
    cantidad: 8,
    ultimaRevision: "2026-09-15T11:45:00",
  },
];

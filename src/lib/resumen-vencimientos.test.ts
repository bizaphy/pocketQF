import { describe, expect, it } from "vitest";
import { resumirVencimientos } from "@/lib/resumen-vencimientos";

const HOY = new Date(2026, 9, 14); // 14 de octubre de 2026

const LOTES = [
  { fechaVencimiento: "2026-10-01", cantidad: 3, categoria: "Analgésicos" }, // vencido
  { fechaVencimiento: "2026-10-14", cantidad: 2, categoria: "Analgésicos" }, // vence hoy
  { fechaVencimiento: "2026-11-14", cantidad: 5, categoria: "Antialérgicos" }, // justo 1 mes
  { fechaVencimiento: "2026-11-15", cantidad: 1, categoria: null }, // 1 mes y 1 día
  { fechaVencimiento: "2027-03-01", cantidad: 4, categoria: "Analgésicos" }, // ~4,5 meses
  { fechaVencimiento: "2028-01-01", cantidad: 9, categoria: "Analgésicos" }, // fuera de todo
];

describe("resumirVencimientos", () => {
  const resumen = Object.fromEntries(
    resumirVencimientos(LOTES, HOY).map((r) => [r.clave, r]),
  );

  it("separa los vencidos del resto", () => {
    expect(resumen.vencidos.lotes).toBe(1);
    expect(resumen.vencidos.unidades).toBe(3);
  });

  it("los plazos son acumulados e incluyen hoy y el día límite", () => {
    expect(resumen["1m"].lotes).toBe(2);
    expect(resumen["3m"].lotes).toBe(3);
    expect(resumen["6m"].lotes).toBe(4);
    expect(resumen["12m"].lotes).toBe(4);
  });

  it("ordena las categorías por lotes y nombra las vacías", () => {
    expect(resumen["6m"].categorias).toEqual([
      { categoria: "Analgésicos", lotes: 2, unidades: 6 },
      { categoria: "Antialérgicos", lotes: 1, unidades: 5 },
      { categoria: "Sin categoría", lotes: 1, unidades: 1 },
    ]);
  });

  it("sin lotes devuelve todo en cero", () => {
    const vacio = resumirVencimientos([], HOY);
    expect(vacio.every((r) => r.lotes === 0 && r.categorias.length === 0)).toBe(
      true,
    );
  });
});

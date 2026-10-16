import { describe, expect, it } from "vitest";
import { reportarPorMes } from "@/lib/reporte-vencimientos";

const HOY = new Date(2026, 9, 14); // 14 de octubre de 2026

const LOTES = [
  { sku: "A", fechaVencimiento: "2026-10-01", cantidad: 3 }, // vencido
  { sku: "A", fechaVencimiento: "2026-10-14", cantidad: 2 }, // vence hoy
  { sku: "B", fechaVencimiento: "2026-11-15", cantidad: 5 },
  { sku: "B", fechaVencimiento: "2026-11-30", cantidad: 1 }, // mismo producto, otro lote
  { sku: "C", fechaVencimiento: "2027-03-01", cantidad: 20 },
  { sku: "D", fechaVencimiento: "2027-09-30", cantidad: 1 }, // último mes del reporte
  { sku: "E", fechaVencimiento: "2027-10-01", cantidad: 99 }, // fuera de los 12 meses
];

describe("reportarPorMes", () => {
  const reporte = reportarPorMes(LOTES, HOY);

  it("arma 12 meses partiendo por el mes actual", () => {
    expect(reporte.meses).toHaveLength(12);
    expect(reporte.meses[0].clave).toBe("2026-10");
    expect(reporte.meses[11].clave).toBe("2027-09");
  });

  it("el mes actual cuenta desde hoy y los vencidos van aparte", () => {
    expect(reporte.meses[0]).toMatchObject({ lotes: 1, unidades: 2 });
    expect(reporte.vencidos).toBe(1);
  });

  it("cuenta lotes, unidades y productos distintos de cada mes", () => {
    expect(reporte.meses[1]).toMatchObject({
      lotes: 2,
      unidades: 6,
      productos: 1,
    });
    expect(reporte.meses[11].lotes).toBe(1);
  });

  it("el mes de mayor riesgo es el de más unidades", () => {
    expect(reporte.meses[reporte.mayorRiesgo!].clave).toBe("2027-03");
  });

  it("en empate de unidades gana el de más lotes", () => {
    const r = reportarPorMes(
      [
        { sku: "A", fechaVencimiento: "2026-11-01", cantidad: 4 },
        { sku: "B", fechaVencimiento: "2026-12-01", cantidad: 2 },
        { sku: "C", fechaVencimiento: "2026-12-02", cantidad: 2 },
      ],
      HOY,
    );
    expect(r.meses[r.mayorRiesgo!].clave).toBe("2026-12");
  });

  it("sin lotes no hay mes de mayor riesgo", () => {
    const r = reportarPorMes([], HOY);
    expect(r.mayorRiesgo).toBeNull();
    expect(r.meses.every((m) => m.lotes === 0)).toBe(true);
  });
});

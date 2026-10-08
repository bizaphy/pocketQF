import { describe, expect, it } from "vitest";
import { esquemaVencimiento } from "@/lib/esquemas";

const valido = {
  productoId: "1",
  lote: "L100",
  fechaVencimiento: "2026-10-02",
  cantidad: "24",
};

describe("esquemaVencimiento", () => {
  it("acepta datos válidos y convierte los números", () => {
    const r = esquemaVencimiento.safeParse(valido);
    expect(r.success).toBe(true);
    expect(r.data?.cantidad).toBe(24); // number, no "24"
  });

  it("rechaza un lote vacío o con solo espacios", () => {
    expect(
      esquemaVencimiento.safeParse({ ...valido, lote: "   " }).success,
    ).toBe(false);
  });

  it("rechaza cantidad 0", () => {
    expect(
      esquemaVencimiento.safeParse({ ...valido, cantidad: "0" }).success,
    ).toBe(false);
  });

  it("rechaza una fecha que no existe", () => {
    const r = esquemaVencimiento.safeParse({
      ...valido,
      fechaVencimiento: "2026-02-30",
    });
    expect(r.success).toBe(false);
  });

  it("rechaza la fecha en formato chileno", () => {
    const r = esquemaVencimiento.safeParse({
      ...valido,
      fechaVencimiento: "02-10-2026",
    });
    expect(r.success).toBe(false);
  });
});

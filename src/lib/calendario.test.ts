import { describe, expect, it } from "vitest";
import { claveMes, leerMes, semanasDelMes } from "@/lib/calendario";

const HOY = new Date(2026, 9, 14); // 14 de octubre de 2026

describe("leerMes", () => {
  it("lee un mes válido", () => {
    expect(claveMes(leerMes("2026-02", HOY))).toBe("2026-02");
  });

  it("usa el mes actual si el texto falta o no es válido", () => {
    expect(claveMes(leerMes(undefined, HOY))).toBe("2026-10");
    expect(claveMes(leerMes("2026-13", HOY))).toBe("2026-10");
    expect(claveMes(leerMes("hola", HOY))).toBe("2026-10");
  });
});

describe("semanasDelMes", () => {
  it("parte el lunes y completa las semanas con días vecinos", () => {
    // octubre 2026 empieza un jueves y termina un sábado
    const semanas = semanasDelMes(new Date(2026, 9, 1));
    expect(semanas).toHaveLength(5);
    expect(semanas.every((s) => s.length === 7)).toBe(true);
    expect(semanas[0][0]).toEqual({
      clave: "2026-09-28",
      numero: 28,
      delMes: false,
    });
    expect(semanas[0][3]).toEqual({
      clave: "2026-10-01",
      numero: 1,
      delMes: true,
    });
    expect(semanas[4][6]).toEqual({
      clave: "2026-11-01",
      numero: 1,
      delMes: false,
    });
  });

  it("un mes que empieza lunes no agrega días del mes anterior", () => {
    // junio 2026 empieza un lunes
    const semanas = semanasDelMes(new Date(2026, 5, 1));
    expect(semanas[0][0].clave).toBe("2026-06-01");
  });
});

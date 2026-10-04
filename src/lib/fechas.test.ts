import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { diasRestantes, formatearFecha } from "@/lib/fechas";

describe("diasRestantes", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // reloj falso
    vi.setSystemTime(new Date(2026, 9, 1, 15, 40)); // 1 de octubre de 2026, 15:40
  });

  afterEach(() => {
    vi.useRealTimers(); // devolver el reloj real
  });

  it("devuelve 0 si vence hoy", () => {
    expect(diasRestantes("2026-10-01")).toBe(0);
  });

  it("devuelve 1 si vence mañana, aunque falten menos de 24 horas", () => {
    expect(diasRestantes("2026-10-02")).toBe(1); // Trampa 1: son las 15:40
  });

  it("devuelve negativo si ya venció", () => {
    expect(diasRestantes("2026-09-28")).toBe(-3);
  });

  it("cuenta bien a través de un cambio de mes", () => {
    expect(diasRestantes("2026-11-01")).toBe(31);
  });
});

describe("formatearFecha", () => {
  it("muestra la fecha en formato chileno, sin correrse un día", () => {
    expect(formatearFecha("2026-10-02")).toBe("02-10-2026"); // Trampa 2
  });
});

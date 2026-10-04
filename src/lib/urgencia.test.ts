import { describe, expect, it } from "vitest";
import { estiloUrgencia, textoDias } from "@/lib/urgencia";
import { UMBRAL_PRONTO, UMBRAL_URGENTE } from "@/lib/umbrales";

describe("textoDias", () => {
  it("dice 'Vencido' si los días son negativos", () => {
    expect(textoDias(-2)).toBe("Vencido");
  });

  it("usa singular para 1 día", () => {
    expect(textoDias(1)).toBe("1 día");
  });

  it("usa plural para 0 y para más de 1", () => {
    expect(textoDias(0)).toBe("0 días");
    expect(textoDias(45)).toBe("45 días");
  });
});

describe("estiloUrgencia", () => {
  it("marca vencido en rojo sólido", () => {
    expect(estiloUrgencia(-1)).toContain("bg-strawberry ");
  });

  it("el límite de urgente todavía es urgente", () => {
    expect(estiloUrgencia(UMBRAL_URGENTE)).toContain("bg-strawberry/15");
  });

  it("un día después del límite de urgente pasa a pronto", () => {
    expect(estiloUrgencia(UMBRAL_URGENTE + 1)).toContain("bg-saffron");
  });

  it("el límite de pronto todavía es pronto", () => {
    expect(estiloUrgencia(UMBRAL_PRONTO)).toContain("bg-saffron");
  });

  it("después del límite de pronto no hay apuro", () => {
    expect(estiloUrgencia(UMBRAL_PRONTO + 1)).toContain("bg-steel");
  });
});

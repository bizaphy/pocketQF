import { describe, expect, it } from "vitest";
import {
  hechasEnPeriodo,
  inicioPeriodo,
  textoFrecuencia,
  textoPlazo,
} from "@/lib/plantillas-tareas";

// miércoles 15 de octubre de 2026, 10:00
const hoy = new Date(2026, 9, 15, 10, 0);

describe("textoFrecuencia", () => {
  it("singular y plural", () => {
    expect(textoFrecuencia(1, "mes")).toBe("1 vez al mes");
    expect(textoFrecuencia(1, "semana")).toBe("1 vez a la semana");
    expect(textoFrecuencia(1, "dia")).toBe("Todos los días");
    expect(textoFrecuencia(2, "semana")).toBe("2 veces por semana");
    expect(textoFrecuencia(3, "dia")).toBe("3 veces por día");
  });
});

describe("inicioPeriodo", () => {
  it("la semana parte el lunes", () => {
    expect(inicioPeriodo("semana", hoy)).toEqual(new Date(2026, 9, 12));
  });

  it("día y mes", () => {
    expect(inicioPeriodo("dia", hoy)).toEqual(new Date(2026, 9, 15));
    expect(inicioPeriodo("mes", hoy)).toEqual(new Date(2026, 9, 1));
  });
});

describe("hechasEnPeriodo", () => {
  const registros = [
    new Date(2026, 9, 11, 18, 0), // domingo: semana anterior
    new Date(2026, 9, 12, 9, 0), // lunes
    new Date(2026, 9, 15, 8, 0), // hoy
  ];

  it("cuenta solo lo hecho desde el inicio del periodo", () => {
    expect(hechasEnPeriodo(registros, "dia", hoy)).toBe(1);
    expect(hechasEnPeriodo(registros, "semana", hoy)).toBe(2);
    expect(hechasEnPeriodo(registros, "mes", hoy)).toBe(3);
  });
});

describe("textoPlazo", () => {
  it("atrasada, hoy, mañana y en N días", () => {
    expect(textoPlazo(-1)).toBe("Atrasada 1 día");
    expect(textoPlazo(-3)).toBe("Atrasada 3 días");
    expect(textoPlazo(0)).toBe("Para hoy");
    expect(textoPlazo(1)).toBe("Para mañana");
    expect(textoPlazo(5)).toBe("En 5 días");
  });
});

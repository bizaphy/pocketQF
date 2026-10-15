import { describe, expect, it } from "vitest";
import {
  COLUMNAS,
  FILAS,
  buscarHueco,
  dentroDelMapa,
  etiquetaUbicacion,
  normalizar,
  posicionLibre,
  seSuperponen,
} from "@/lib/mapa";

describe("dentroDelMapa", () => {
  it("acepta un mueble que llega justo al borde", () => {
    expect(
      dentroDelMapa({ x: COLUMNAS - 4, y: FILAS - 1, ancho: 4, alto: 1 }),
    ).toBe(true);
  });

  it("rechaza lo que se sale, mide 0 o no es entero", () => {
    expect(dentroDelMapa({ x: COLUMNAS - 3, y: 0, ancho: 4, alto: 1 })).toBe(
      false,
    );
    expect(dentroDelMapa({ x: -1, y: 0, ancho: 1, alto: 1 })).toBe(false);
    expect(dentroDelMapa({ x: 0, y: 0, ancho: 0, alto: 1 })).toBe(false);
    expect(dentroDelMapa({ x: 0.5, y: 0, ancho: 1, alto: 1 })).toBe(false);
  });
});

describe("seSuperponen", () => {
  const a = { x: 0, y: 0, ancho: 4, alto: 1 };

  it("detecta celdas compartidas", () => {
    expect(seSuperponen(a, { x: 3, y: 0, ancho: 2, alto: 2 })).toBe(true);
  });

  it("tocarse por el borde no es superponerse", () => {
    expect(seSuperponen(a, { x: 4, y: 0, ancho: 2, alto: 1 })).toBe(false);
    expect(seSuperponen(a, { x: 0, y: 1, ancho: 4, alto: 1 })).toBe(false);
  });
});

describe("posicionLibre y buscarHueco", () => {
  const otros = [{ id: 1, x: 0, y: 0, ancho: 4, alto: 1 }];

  it("un mueble puede quedarse donde está (se ignora a sí mismo)", () => {
    expect(posicionLibre({ x: 0, y: 0, ancho: 4, alto: 1 }, otros, 1)).toBe(
      true,
    );
    expect(posicionLibre({ x: 0, y: 0, ancho: 4, alto: 1 }, otros)).toBe(false);
  });

  it("busca el primer lugar libre de izquierda a derecha", () => {
    expect(buscarHueco(4, 1, otros)).toEqual({ x: 4, y: 0 });
  });

  it("devuelve null si no cabe", () => {
    expect(buscarHueco(COLUMNAS + 1, 1, [])).toBeNull();
  });
});

describe("etiquetaUbicacion", () => {
  it("arma el texto completo con zona en mayúsculas, detalle y repisa", () => {
    expect(
      etiquetaUbicacion(
        "Sala de ventas",
        { nombre: "Estante 1", detalle: "sala" },
        2,
      ),
    ).toBe("SALA DE VENTAS - Estante 1 (sala), Repisa 2");
  });

  it("sin detalle ni repisa", () => {
    expect(
      etiquetaUbicacion("Bodega", { nombre: "Estante 3", detalle: null }),
    ).toBe("BODEGA - Estante 3");
  });
});

describe("normalizar", () => {
  it("quita tildes y mayúsculas", () => {
    expect(normalizar("  Oftálmicos ")).toBe("oftalmicos");
  });
});

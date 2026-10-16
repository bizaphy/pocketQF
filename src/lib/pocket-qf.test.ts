import { describe, expect, it } from "vitest";
import {
  buscarEnFichas,
  coincideNombre,
  exclusionesDeFicha,
  fichasDeProducto,
  productosDeFicha,
  resaltar,
  terminosDeFicha,
} from "@/lib/pocket-qf";

const hioscina = {
  id: 1,
  principioActivo: "Hioscina",
  terminos: "hiocina, butilbromuro, b",
  productoIds: [],
};
const ibuprofeno = {
  id: 2,
  principioActivo: "Ibuprofeno",
  terminos: null,
  productoIds: [30], // marca sin el principio activo en el nombre
};

describe("terminosDeFicha", () => {
  it("normaliza, quita repetidos y términos muy cortos", () => {
    expect(terminosDeFicha(hioscina)).toEqual([
      "hioscina",
      "hiocina",
      "butilbromuro",
    ]);
    expect(
      terminosDeFicha({
        principioActivo: "Olmesartán",
        terminos: "olmesartan",
      }),
    ).toEqual(["olmesartan"]);
  });
});

describe("coincideNombre", () => {
  it("encuentra el principio activo dentro del nombre, sin importar tildes", () => {
    expect(
      coincideNombre("OLMEPRESS OLMESARTAN 20MG 40 COMP REC", ["olmesartan"]),
    ).toBe(true);
    expect(
      coincideNombre("BUSCAPINA N-BUTILBROMURO DE HIOCINA 20MG/1ML", [
        "hiocina",
      ]),
    ).toBe(true);
  });

  it("solo palabras completas", () => {
    expect(coincideNombre("SALBUTAMOL INHALADOR", ["sal"])).toBe(false);
    expect(coincideNombre("PARACETAMOL/CAFEINA", ["cafeina"])).toBe(true);
  });
});

describe("fichasDeProducto", () => {
  const fichas = [hioscina, ibuprofeno];

  it("por nombre, a mano, combinaciones y sin ficha", () => {
    expect(
      fichasDeProducto({ id: 10, nombre: "BUSCAPINA HIOCINA 10MG" }, fichas),
    ).toEqual([hioscina]);
    expect(
      fichasDeProducto({ id: 30, nombre: "KITADOL FORTE" }, fichas),
    ).toEqual([ibuprofeno]);
    expect(
      fichasDeProducto(
        { id: 11, nombre: "COMBINADO HIOSCINA IBUPROFENO 400MG" },
        fichas,
      ),
    ).toEqual([hioscina, ibuprofeno]);
    expect(
      fichasDeProducto({ id: 12, nombre: "PAÑALES BABYSEC" }, fichas),
    ).toEqual([]);
  });
});

describe("productosDeFicha", () => {
  it("separa los que coinciden por nombre de los agregados a mano", () => {
    const productos = [
      { id: 20, nombre: "IBUPROFENO 400MG 20 COMP" },
      { id: 30, nombre: "MARCA X 400MG" },
      { id: 40, nombre: "OMEPRAZOL 20MG" },
    ];
    const r = productosDeFicha(ibuprofeno, productos);
    expect(r.porNombre.map((p) => p.id)).toEqual([20]);
    expect(r.aMano.map((p) => p.id)).toEqual([30]);
  });
});

describe("buscarEnFichas", () => {
  const anfebutamona = {
    id: 3,
    principioActivo: "Anfebutamona",
    indicaciones: "Depresión. Apoyo para dejar de fumar.",
    efectosSecundarios: "Insomnio, boca seca",
    observaciones: null,
  };
  const zolpidem = {
    id: 4,
    principioActivo: "Zolpidem",
    indicaciones: "Insomnio",
    efectosSecundarios: "Somnolencia al día siguiente",
    observaciones: null,
  };
  const fichas = [anfebutamona, zolpidem];

  it("busca por uso sin importar tildes, orden ni palabras de relleno", () => {
    expect(buscarEnFichas(fichas, "para dejar de fumar")).toEqual([
      { ficha: anfebutamona, campos: ["indicaciones"] },
    ]);
    expect(buscarEnFichas(fichas, "DEPRESION").map((r) => r.ficha.id)).toEqual([
      3,
    ]);
    expect(buscarEnFichas(fichas, "fumar dejar")).toHaveLength(1);
  });

  it("indica en qué campos aparece", () => {
    expect(buscarEnFichas(fichas, "insomnio")).toEqual([
      { ficha: anfebutamona, campos: ["efectosSecundarios"] },
      { ficha: zolpidem, campos: ["indicaciones"] },
    ]);
  });

  it("todas las palabras deben aparecer; vacío no busca", () => {
    expect(buscarEnFichas(fichas, "fumar somnolencia")).toEqual([]);
    expect(buscarEnFichas(fichas, "de la")).toEqual([]);
  });
});

describe("resaltar", () => {
  it("marca las palabras respetando tildes y mayúsculas del original", () => {
    expect(resaltar("Depresión y DEPRESION", ["depresion"])).toEqual([
      { texto: "Depresión", marcado: true },
      { texto: " y ", marcado: false },
      { texto: "DEPRESION", marcado: true },
    ]);
  });
});

describe("exclusiones", () => {
  const zinc = {
    id: 5,
    principioActivo: "Zinc",
    terminos: "gluconato de zinc, -oxido de zinc, -shampoo",
    productoIds: [99],
  };

  it("separa términos y exclusiones", () => {
    expect(terminosDeFicha(zinc)).toEqual(["zinc", "gluconato de zinc"]);
    expect(exclusionesDeFicha(zinc)).toEqual(["oxido de zinc", "shampoo"]);
  });

  it("un producto con un término excluido no se asocia por nombre, pero sí a mano", () => {
    expect(
      fichasDeProducto({ id: 1, nombre: "ZINC 15MG 30 CAPS" }, [zinc]),
    ).toEqual([zinc]);
    expect(
      fichasDeProducto({ id: 2, nombre: "PASTA LASSAR ÓXIDO DE ZINC 25G" }, [
        zinc,
      ]),
    ).toEqual([]);
    expect(
      fichasDeProducto({ id: 3, nombre: "DHS SHAMPOO ZINC 2%" }, [zinc]),
    ).toEqual([]);
    expect(
      fichasDeProducto({ id: 99, nombre: "OXIDO DE ZINC 10GR" }, [zinc]),
    ).toEqual([zinc]);
  });
});

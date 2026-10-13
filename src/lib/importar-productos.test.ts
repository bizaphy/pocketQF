import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { leerExcelProductos } from "@/lib/importar-productos";

// arma un Excel en memoria con las filas dadas (la primera es el encabezado)
async function crearExcel(filas: unknown[][]): Promise<ArrayBuffer> {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet("Sheet1");
  filas.forEach((f) => hoja.addRow(f));
  return (await libro.xlsx.writeBuffer()) as ArrayBuffer;
}

// mismo encabezado que el Excel real de la farmacia
const ENCABEZADO = [
  "Nombre",
  "SKU",
  "Código de Barras",
  "Descripción Corta",
  "Coste",
  "Stock en Farmacias Patagonia",
  "Precio en Farmacias Patagonia",
  "Aviso de Quiebre de Stock en Farmacias Patagonia",
  "Categoría",
];

describe("leerExcelProductos", () => {
  it("lee código de barra, nombre, stock y categoría e ignora el resto", async () => {
    const excel = await crearExcel([
      ENCABEZADO,
      [
        "PARACETAMOL 500MG",
        "IGNORAR",
        "7800060005754",
        "x",
        100,
        "11",
        "5490",
        "8",
        "Genericos",
      ],
    ]);
    expect(await leerExcelProductos(excel)).toEqual({
      ok: true,
      filas: [
        {
          codigoBarra: "7800060005754",
          nombre: "PARACETAMOL 500MG",
          stock: 11,
          categoria: "Genericos",
        },
      ],
      avisos: [],
    });
  });

  it("acepta el código de barra guardado como número y el stock vacío como 0", async () => {
    const excel = await crearExcel([
      ENCABEZADO,
      [
        "IBUPROFENO",
        null,
        7800060005723,
        null,
        null,
        null,
        null,
        null,
        "Analgésicos",
      ],
    ]);
    const r = await leerExcelProductos(excel);
    expect(r.ok && r.filas[0]).toMatchObject({
      codigoBarra: "7800060005723",
      stock: 0,
    });
  });

  it("encuentra las columnas aunque cambien de orden", async () => {
    const excel = await crearExcel([
      ["Categoría", "Stock", "codigo de barras", "nombre"],
      ["Vitaminas", 3, "123", "VITAMINA C"],
    ]);
    const r = await leerExcelProductos(excel);
    expect(r.ok && r.filas).toEqual([
      {
        codigoBarra: "123",
        nombre: "VITAMINA C",
        stock: 3,
        categoria: "Vitaminas",
      },
    ]);
  });

  it("salta filas vacías", async () => {
    const excel = await crearExcel([
      ENCABEZADO,
      ["A", null, "1", null, null, "1", null, null, "General"],
      [],
      ["B", null, "2", null, null, "2", null, null, "General"],
    ]);
    const r = await leerExcelProductos(excel);
    expect(r.ok && r.filas.map((f) => f.codigoBarra)).toEqual(["1", "2"]);
  });

  it("si un código se repite, usa la última fila y avisa", async () => {
    const excel = await crearExcel([
      ENCABEZADO,
      ["VIEJO", null, "1", null, null, "1", null, null, "General"],
      ["NUEVO", null, "1", null, null, "5", null, null, "General"],
    ]);
    const r = await leerExcelProductos(excel);
    expect(r.ok && r.filas).toEqual([
      { codigoBarra: "1", nombre: "NUEVO", stock: 5, categoria: "General" },
    ]);
    expect(r.ok && r.avisos).toHaveLength(1);
  });

  it("falla si falta una columna obligatoria", async () => {
    const excel = await crearExcel([
      ["Nombre", "SKU", "Stock"],
      ["A", "1", 2],
    ]);
    expect(await leerExcelProductos(excel)).toEqual({
      ok: false,
      errores: ["Faltan columnas en el Excel: Código de Barras, Categoría"],
    });
  });

  it("falla con el número de fila si falta el código o el stock no es un número", async () => {
    const excel = await crearExcel([
      ENCABEZADO,
      ["SIN CODIGO", null, null, null, null, "1", null, null, "General"],
      ["STOCK MALO", null, "2", null, null, "diez", null, null, "General"],
    ]);
    expect(await leerExcelProductos(excel)).toEqual({
      ok: false,
      errores: [
        "Fila 2: falta el código de barra",
        'Fila 3: el stock "diez" no es un número entero',
      ],
    });
  });

  it("falla si el archivo no es un Excel", async () => {
    const r = await leerExcelProductos(new TextEncoder().encode("hola").buffer);
    expect(r.ok).toBe(false);
  });
});

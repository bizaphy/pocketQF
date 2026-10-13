// Lee el Excel semanal de productos y devuelve solo lo que usa el sistema:
// código de barra, nombre, stock y categoría. El resto de las columnas se ignora.
// Las columnas se buscan por su encabezado (no por posición), así el orden puede cambiar.

import ExcelJS from "exceljs";

export type FilaProducto = {
  codigoBarra: string;
  nombre: string;
  stock: number;
  categoria: string | null;
};

export type ResultadoLectura =
  | { ok: true; filas: FilaProducto[]; avisos: string[] }
  | { ok: false; errores: string[] };

// "Código de Barras" → "codigo de barras": sin tildes, minúsculas y sin espacios extra
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita las tildes que dejó normalize("NFD")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// cada columna que importa, con la regla para reconocer su encabezado
const COLUMNAS = {
  codigoBarra: (h: string) => h.startsWith("codigo de barra"),
  nombre: (h: string) => h === "nombre",
  stock: (h: string) => h.startsWith("stock"), // ej: "Stock en Farmacias Patagonia"
  categoria: (h: string) => h.startsWith("categoria"),
};

// el valor de una celda como texto, sea número, texto, fórmula o texto con formato
function textoCelda(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") return String(valor); // 7800060005754 → "7800060005754"
  if (typeof valor === "string") return valor.trim();
  if (typeof valor === "object") {
    if ("richText" in valor)
      return valor.richText
        .map((t) => t.text)
        .join("")
        .trim();
    if ("result" in valor) return textoCelda(valor.result as ExcelJS.CellValue);
    if ("text" in valor) return String(valor.text).trim();
  }
  return String(valor).trim();
}

const MAX_ERRORES = 10; // no tiene sentido listar 3000 errores si el archivo está mal

export async function leerExcelProductos(
  datos: ArrayBuffer,
): Promise<ResultadoLectura> {
  const libro = new ExcelJS.Workbook();
  try {
    await libro.xlsx.load(datos);
  } catch {
    return { ok: false, errores: ["El archivo no es un Excel (.xlsx) válido"] };
  }

  const hoja = libro.worksheets[0];
  if (!hoja) return { ok: false, errores: ["El Excel no tiene hojas"] };

  // 1. ubicar cada columna en la fila de encabezados (fila 1)
  const encabezados = hoja.getRow(1);
  const posicion: Partial<Record<keyof typeof COLUMNAS, number>> = {};
  encabezados.eachCell((celda, col) => {
    const h = normalizar(textoCelda(celda.value));
    for (const [clave, coincide] of Object.entries(COLUMNAS)) {
      const k = clave as keyof typeof COLUMNAS;
      if (posicion[k] === undefined && coincide(h)) posicion[k] = col;
    }
  });

  const faltantes = [
    !posicion.codigoBarra && "Código de Barras",
    !posicion.nombre && "Nombre",
    !posicion.stock && "Stock",
    !posicion.categoria && "Categoría",
  ].filter(Boolean);
  if (faltantes.length > 0) {
    return {
      ok: false,
      errores: [`Faltan columnas en el Excel: ${faltantes.join(", ")}`],
    };
  }

  // 2. leer las filas
  const porCodigo = new Map<string, FilaProducto>(); // si un código se repite, gana la última fila
  const errores: string[] = [];
  const avisos: string[] = [];

  for (let n = 2; n <= hoja.rowCount; n++) {
    const fila = hoja.getRow(n);
    const leer = (col: number) => textoCelda(fila.getCell(col).value);

    const codigoBarra = leer(posicion.codigoBarra!);
    const nombre = leer(posicion.nombre!);
    const stockTexto = leer(posicion.stock!);
    const categoria = leer(posicion.categoria!);

    if (!codigoBarra && !nombre && !stockTexto && !categoria) continue; // fila vacía

    if (!codigoBarra) errores.push(`Fila ${n}: falta el código de barra`);
    if (!nombre) errores.push(`Fila ${n}: falta el nombre`);
    // stock vacío = 0; si viene algo, debe ser un número entero
    const stock = stockTexto === "" ? 0 : Number(stockTexto);
    if (!Number.isInteger(stock)) {
      errores.push(
        `Fila ${n}: el stock "${stockTexto}" no es un número entero`,
      );
    }
    if (errores.length >= MAX_ERRORES) break;
    if (!codigoBarra || !nombre || !Number.isInteger(stock)) continue;

    if (porCodigo.has(codigoBarra)) {
      avisos.push(`El código ${codigoBarra} se repite; se usó la fila ${n}`);
    }
    porCodigo.set(codigoBarra, {
      codigoBarra,
      nombre,
      stock,
      categoria: categoria || null,
    });
  }

  if (errores.length > 0) return { ok: false, errores };
  if (porCodigo.size === 0) {
    return { ok: false, errores: ["El Excel no tiene productos"] };
  }

  return { ok: true, filas: [...porCodigo.values()], avisos };
}

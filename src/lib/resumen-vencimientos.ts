// Resumen de vencimientos para el contador: cuántos lotes vencen dentro de cada plazo
// y qué categorías concentran más lotes. Los plazos son acumulados ("dentro de 3 meses"
// incluye lo que vence en 1 mes) y no cuentan los ya vencidos, que van aparte.

import { addMonths, format } from "date-fns";

export const PLAZOS = [
  { clave: "vencidos", etiqueta: "Vencidos", meses: 0 },
  { clave: "1m", etiqueta: "1 mes", meses: 1 },
  { clave: "3m", etiqueta: "3 meses", meses: 3 },
  { clave: "6m", etiqueta: "6 meses", meses: 6 },
  { clave: "12m", etiqueta: "12 meses", meses: 12 },
] as const;

export type ClavePlazo = (typeof PLAZOS)[number]["clave"];

export type CategoriaAfectada = {
  categoria: string; // "Sin categoría" si el producto no tiene
  lotes: number;
  unidades: number;
};

export type ResumenPlazo = {
  clave: ClavePlazo;
  etiqueta: string;
  lotes: number;
  unidades: number;
  categorias: CategoriaAfectada[]; // de más a menos lotes
};

type Lote = {
  fechaVencimiento: string; // "yyyy-MM-dd"
  cantidad: number;
  categoria: string | null;
};

export function resumirVencimientos(lotes: Lote[], hoy: Date): ResumenPlazo[] {
  // las fechas vienen como "yyyy-MM-dd", así que se comparan como texto
  const claveHoy = format(hoy, "yyyy-MM-dd");

  return PLAZOS.map((plazo) => {
    const limite = format(addMonths(hoy, plazo.meses), "yyyy-MM-dd");
    const dentro = lotes.filter((l) =>
      plazo.clave === "vencidos"
        ? l.fechaVencimiento < claveHoy
        : l.fechaVencimiento >= claveHoy && l.fechaVencimiento <= limite,
    );

    const porCategoria = new Map<string, CategoriaAfectada>();
    for (const l of dentro) {
      const nombre = l.categoria ?? "Sin categoría";
      const c = porCategoria.get(nombre) ?? {
        categoria: nombre,
        lotes: 0,
        unidades: 0,
      };
      c.lotes += 1;
      c.unidades += l.cantidad;
      porCategoria.set(nombre, c);
    }

    return {
      clave: plazo.clave,
      etiqueta: plazo.etiqueta,
      lotes: dentro.length,
      unidades: dentro.reduce((s, l) => s + l.cantidad, 0),
      // empate en lotes: gana la que tiene más unidades
      categorias: [...porCategoria.values()].sort(
        (a, b) => b.lotes - a.lotes || b.unidades - a.unidades,
      ),
    };
  });
}

// Reporte de vencimientos por mes: cuántos lotes, unidades y productos distintos vencen
// en cada uno de los próximos 12 meses calendario, partiendo por el mes actual.
// El mes actual cuenta desde hoy: lo que ya venció va aparte (vencidos).
// Mes de mayor riesgo: el que tiene más unidades por vencer (empate: más lotes; luego el más próximo).

import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";

export const MESES_REPORTE = 12;

export type MesReporte = {
  clave: string; // "yyyy-MM"
  etiqueta: string; // "oct 2026"
  lotes: number;
  unidades: number;
  productos: number; // productos distintos (un producto puede tener varios lotes en el mes)
};

export type ReporteVencimientos = {
  meses: MesReporte[];
  mayorRiesgo: number | null; // índice en meses; null si no vence nada en los 12 meses
  vencidos: number; // lotes ya vencidos, que no entran en el reporte
};

type Lote = {
  sku: string;
  fechaVencimiento: string; // "yyyy-MM-dd"
  cantidad: number;
};

export function reportarPorMes(lotes: Lote[], hoy: Date): ReporteVencimientos {
  // las fechas vienen como "yyyy-MM-dd", así que se comparan como texto
  const claveHoy = format(hoy, "yyyy-MM-dd");

  const meses = Array.from({ length: MESES_REPORTE }, (_, i) => {
    const mes = addMonths(hoy, i);
    const clave = format(mes, "yyyy-MM");
    const delMes = lotes.filter(
      (l) => l.fechaVencimiento >= claveHoy && l.fechaVencimiento.startsWith(clave),
    );
    return {
      clave,
      etiqueta: format(mes, "MMM yyyy", { locale: es }),
      lotes: delMes.length,
      unidades: delMes.reduce((s, l) => s + l.cantidad, 0),
      productos: new Set(delMes.map((l) => l.sku)).size,
    };
  });

  let mayorRiesgo: number | null = null;
  meses.forEach((m, i) => {
    if (m.lotes === 0) return;
    const actual = mayorRiesgo === null ? null : meses[mayorRiesgo];
    // estricto (>): en empate total se queda el mes más próximo
    if (
      !actual ||
      m.unidades > actual.unidades ||
      (m.unidades === actual.unidades && m.lotes > actual.lotes)
    ) {
      mayorRiesgo = i;
    }
  });

  return {
    meses,
    mayorRiesgo,
    vencidos: lotes.filter((l) => l.fechaVencimiento < claveHoy).length,
  };
}

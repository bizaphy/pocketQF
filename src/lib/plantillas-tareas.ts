// Tareas predefinidas para crear tareas con un clic, y reglas de los periodos
// de las tareas periódicas (cuántas veces se hicieron "esta semana", "este mes"...).
// Las plantillas son genéricas a propósito: el detalle (proveedor, cliente, producto) se escribe aparte.

import { startOfDay, startOfMonth, startOfWeek } from "date-fns";

export type Periodo = "dia" | "semana" | "mes";

export const PERIODOS: Record<Periodo, string> = {
  dia: "día",
  semana: "semana",
  mes: "mes",
};

export type PlantillaPeriodica = {
  titulo: string;
  veces: number;
  periodo: Periodo;
};

export type PlantillaFortuita = {
  titulo: string;
  ejemplo: string; // placeholder del campo detalle
};

export const PLANTILLAS_PERIODICAS: PlantillaPeriodica[] = [
  { titulo: "Ingreso de controlados al ISP", veces: 1, periodo: "mes" },
  { titulo: "Limpieza de mesón", veces: 2, periodo: "semana" },
  {
    titulo: "Reposición de refrigeradores con bebestibles",
    veces: 1,
    periodo: "semana",
  },
  {
    titulo: "Almacenar registro mensual de temperaturas",
    veces: 1,
    periodo: "mes",
  },
  {
    titulo: "Registrar temperatura y humedad",
    veces: 1,
    periodo: "dia",
  },
  { titulo: "Cuadratura de caja", veces: 1, periodo: "dia" },
  {
    titulo: "Cuadratura del libro de controlados",
    veces: 1,
    periodo: "semana",
  },
  { titulo: "Revisar vencimientos próximos", veces: 1, periodo: "semana" },
  { titulo: "Retirar productos vencidos", veces: 1, periodo: "mes" },
  { titulo: "Pedido de reposición a droguería", veces: 1, periodo: "semana" },
  {
    titulo: "Revisar alertas y comunicados del ISP",
    veces: 1,
    periodo: "semana",
  },
  { titulo: "Limpieza de estanterías", veces: 1, periodo: "semana" },
  { titulo: "Orden de bodega", veces: 1, periodo: "semana" },
  {
    titulo: "Limpieza del refrigerador de medicamentos",
    veces: 1,
    periodo: "mes",
  },
  { titulo: "Archivar recetas retenidas", veces: 1, periodo: "mes" },
];

export const PLANTILLAS_FORTUITAS: PlantillaFortuita[] = [
  {
    titulo: "Enviar formulario de devolución a proveedor",
    ejemplo: "Ej: Proveedor X - Paracetamol 500 mg, lote L100",
  },
  {
    titulo: "Enviar documentos",
    ejemplo: "Ej: Facturas de septiembre a contabilidad",
  },
  {
    titulo: "Contactar a cliente",
    ejemplo: "Ej: Sra. Pérez, avisar que llegó su medicamento",
  },
  {
    titulo: "Revisar producto alternativo",
    ejemplo: "Ej: Bioequivalente de losartán 50 mg",
  },
  {
    titulo: "Solicitar producto faltante",
    ejemplo: "Ej: Insulina glargina a droguería Y",
  },
  {
    titulo: "Reclamo por pedido incompleto o dañado",
    ejemplo: "Ej: Pedido del lunes, faltaron 2 cajas",
  },
  {
    titulo: "Retirar lote por alerta sanitaria",
    ejemplo: "Ej: Alerta ISP, lote A7",
  },
  {
    titulo: "Reservar producto para cliente",
    ejemplo: "Ej: 2 cajas de ibuprofeno para Juan, retira el viernes",
  },
  {
    titulo: "Revisar diferencia de inventario",
    ejemplo: "Ej: Faltan 3 unidades de amoxicilina",
  },
  {
    titulo: "Coordinar despacho o retiro",
    ejemplo: "Ej: Despacho a domicilio, calle X 123",
  },
  {
    titulo: "Gestionar mantención de equipo",
    ejemplo: "Ej: Refrigerador 2 no enfría bien",
  },
  {
    titulo: "Responder correo o solicitud",
    ejemplo: "Ej: Encuesta de la jefatura zonal",
  },
];

// "1 vez al mes", "2 veces por semana", "todos los días"
export function textoFrecuencia(veces: number, periodo: Periodo): string {
  if (veces === 1) {
    if (periodo === "dia") return "Todos los días";
    return periodo === "semana" ? "1 vez a la semana" : "1 vez al mes";
  }
  return `${veces} veces por ${PERIODOS[periodo]}`;
}

// desde cuándo se cuentan las veces del periodo actual (semanas parten el lunes)
export function inicioPeriodo(periodo: Periodo, hoy: Date): Date {
  if (periodo === "dia") return startOfDay(hoy);
  if (periodo === "semana") return startOfWeek(hoy, { weekStartsOn: 1 });
  return startOfMonth(hoy);
}

// "hoy", "esta semana", "este mes"
export function textoPeriodoActual(periodo: Periodo): string {
  if (periodo === "dia") return "hoy";
  if (periodo === "semana") return "esta semana";
  return "este mes";
}

// cuántas de las veces hechas caen en el periodo actual
export function hechasEnPeriodo(
  registros: Date[],
  periodo: Periodo,
  hoy: Date,
): number {
  const desde = inicioPeriodo(periodo, hoy).getTime();
  return registros.filter((r) => r.getTime() >= desde).length;
}

// etiqueta de la fecha límite de una fortuita según los días que faltan
export function textoPlazo(dias: number): string {
  if (dias < 0)
    return dias === -1 ? "Atrasada 1 día" : `Atrasada ${-dias} días`;
  if (dias === 0) return "Para hoy";
  if (dias === 1) return "Para mañana";
  return `En ${dias} días`;
}

// Arma la grilla de un mes para el calendario de inventarios.
// Las semanas parten el lunes y se rellenan con días del mes anterior y siguiente para completar filas.

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type DiaCalendario = {
  clave: string; // "2026-10-14": sirve para cruzar con los inventarios del día
  numero: number;
  delMes: boolean; // false: relleno del mes anterior o siguiente
};

// convierte una fecha al día local en formato "yyyy-MM-dd"
export function claveDia(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}

// "2026-10" → primer día de ese mes; si el texto no es válido, el mes de `hoy`
export function leerMes(texto: string | undefined, hoy: Date): Date {
  if (texto && /^\d{4}-(0[1-9]|1[0-2])$/.test(texto)) {
    return parse(texto, "yyyy-MM", hoy);
  }
  return startOfMonth(hoy);
}

export function claveMes(fecha: Date): string {
  return format(fecha, "yyyy-MM");
}

export function mesVecino(mes: Date, delta: number): Date {
  return addMonths(mes, delta);
}

export function semanasDelMes(mes: Date): DiaCalendario[][] {
  const dias = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mes), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mes), { weekStartsOn: 1 }),
  });

  const semanas: DiaCalendario[][] = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(
      dias.slice(i, i + 7).map((d) => ({
        clave: claveDia(d),
        numero: d.getDate(),
        delMes: isSameMonth(d, mes),
      })),
    );
  }
  return semanas;
}

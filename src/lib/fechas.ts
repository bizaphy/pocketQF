import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function diasRestantes(fechaVencimiento: string): number {
  return differenceInCalendarDays(parseISO(fechaVencimiento), new Date());
}

export function formatearFecha(iso: string): string {
  return format(parseISO(iso), "dd-MM-yyyy");
}

//para fechaUltimaRevision se necesita la fecha y la hora, por eso usamos toLocaleString
//recibe un Date: Drizzle ya lo convierte (mode: "timestamp")
export function formatearFechaHora(fecha: Date): string {
  return fecha.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// para las notas: día de la semana, fecha y hora exacta. Ej: "lunes 13-10-2026, 14:32"
export function formatearDiaFechaHora(fecha: Date): string {
  return format(fecha, "EEEE dd-MM-yyyy, HH:mm", { locale: es });
}

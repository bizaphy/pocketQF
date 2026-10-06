import { differenceInCalendarDays, format, parseISO } from "date-fns";

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

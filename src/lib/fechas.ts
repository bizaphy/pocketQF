const MS_POR_DIA = 1000 * 60 * 60 * 24;

export function diasRestantes(fechaVencimiento: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); //para que sea el valor a media noche, al restar seran numeros enteros.
  const vence = new Date(`${fechaVencimiento}T00:00:00`); //ej. ("2026-10-02T00:00:00") es el dia a media noche
  return Math.round((vence.getTime() - hoy.getTime()) / MS_POR_DIA); //el round es por si llega a cambiar la hora y el gettime deja la fecha en MS.
}

export function formatearFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CL"); //para D-M-Y
}

//para fechaUltimaRevision se necesita la fecha y la hora, por eso usamos toLocaleString
export function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

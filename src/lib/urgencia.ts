import { UMBRAL_PRONTO, UMBRAL_URGENTE } from "@/lib/umbrales";

//clases TW (colores de la paleta definidos en globals.css)
//semaforo: rojo fuerte (vencido) → rojo suave (urgente) → amarillo (pronto) → azul suave (sin apuro)
export function estiloUrgencia(dias: number): string {
  if (dias < 0) return "bg-strawberry text-white";
  if (dias <= UMBRAL_URGENTE) return "bg-strawberry/15 text-strawberry";
  if (dias <= UMBRAL_PRONTO) return "bg-saffron/30 text-deep-space";
  return "bg-steel/10 text-steel"; //sin apuro
}

//texto de la etiqueta: "Vencido", "1 día" (singular) o "N días"
export function textoDias(dias: number): string {
  if (dias < 0) return "Vencido";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

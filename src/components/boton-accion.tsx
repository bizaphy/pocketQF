// Botón que ejecuta una acción del servidor sin confirmación (ej: marcar una tarea como hecha)
// y avisa el resultado con un toast. Recibe la acción ya armada (ej: marcarHechaAccion.bind(null, id)).
// Con `icono` muestra solo el ícono en un botón redondo; el texto queda para lectores de pantalla y como tooltip.

"use client";

import { useTransition } from "react";
import { toast } from "sonner";

const VARIANTES = {
  principal:
    "rounded-lg bg-sage px-3 py-1.5 text-sm font-semibold text-white hover:bg-sage/90",
  secundario:
    "rounded-lg px-3 py-1.5 text-sm font-semibold text-steel hover:bg-honeydew",
};

// trazos SVG (viewBox 24x24)
const ICONOS = {
  check: "M5 12.5l4.5 4.5L19 7.5",
};

export default function BotonAccion({
  texto,
  textoPendiente = "Guardando...",
  accion,
  variante = "principal",
  icono,
}: {
  texto: string;
  textoPendiente?: string;
  accion: () => Promise<{ ok: boolean; mensaje: string }>;
  variante?: keyof typeof VARIANTES;
  icono?: keyof typeof ICONOS;
}) {
  const [pendiente, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() =>
        iniciar(async () => {
          const r = await accion();
          if (r.ok) toast.success(r.mensaje);
          else toast.error(r.mensaje);
        })
      }
      aria-label={icono ? texto : undefined}
      title={icono ? texto : undefined}
      className={`${VARIANTES[variante]} shrink-0 transition-colors disabled:opacity-50 ${
        icono ? "flex size-8 items-center justify-center rounded-full p-0" : ""
      }`}
    >
      {icono ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 ${pendiente ? "animate-pulse" : ""}`}
          aria-hidden
        >
          <path d={ICONOS[icono]} />
        </svg>
      ) : pendiente ? (
        textoPendiente
      ) : (
        texto
      )}
    </button>
  );
}

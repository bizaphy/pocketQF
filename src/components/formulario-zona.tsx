// Crea una zona nueva del mapa (ej: "Sala de ventas", "Bodega").
// Al guardar, la acción redirige al mapa de la zona nueva en modo edición.

"use client";

import { useActionState } from "react";
import { crearZonaAccion } from "@/actions/ubicaciones";

export default function FormularioZona({
  placeholder = "Ej: Sala de ventas",
}: {
  placeholder?: string;
}) {
  const [estado, accion, pendiente] = useActionState(crearZonaAccion, null);
  const error =
    estado?.errores?.nombre?.[0] ??
    (estado?.ok === false ? estado.mensaje : undefined);

  return (
    <form action={accion} className="grid gap-1">
      <div className="flex gap-2">
        <input
          name="nombre"
          required
          maxLength={40}
          placeholder={placeholder}
          aria-label="Nombre de la zona"
          className="input min-w-0 flex-1 py-1.5 text-sm"
        />
        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-3 py-1.5 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Creando..." : "Crear zona"}
        </button>
      </div>
      {error && <span className="text-xs text-strawberry">{error}</span>}
    </form>
  );
}

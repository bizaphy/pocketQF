// Datos de un mueble del mapa: nombre, detalle (lo que va entre paréntesis) y tipo

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import {
  editarEstanteAccion,
  type EstadoFormularioUbicacion,
} from "@/actions/ubicaciones";
import Campo from "@/components/campo";
import { TIPOS, type TipoMueble } from "@/lib/mapa";

export default function FormularioEstante({
  estante,
}: {
  estante: {
    id: number;
    nombre: string;
    detalle: string | null;
    tipo: TipoMueble;
  };
}) {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoFormularioUbicacion, formData: FormData) => {
      const r = await editarEstanteAccion(anterior, formData);
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  return (
    <form action={accion} className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="id" value={estante.id} />
      <Campo label="Nombre" error={estado?.errores?.nombre?.[0]}>
        <input
          name="nombre"
          required
          maxLength={40}
          defaultValue={estante.nombre}
          className="input"
        />
      </Campo>
      <Campo label="Detalle (opcional)" error={estado?.errores?.detalle?.[0]}>
        <input
          name="detalle"
          maxLength={40}
          defaultValue={estante.detalle ?? ""}
          placeholder="Ej: sala"
          className="input"
        />
      </Campo>
      <Campo label="Tipo" error={estado?.errores?.tipo?.[0]}>
        <select name="tipo" defaultValue={estante.tipo} className="input">
          {Object.entries(TIPOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </Campo>
      <div className="sm:col-span-3">
        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Guardar datos"}
        </button>
      </div>
    </form>
  );
}

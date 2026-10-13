// Formulario para subir el Excel semanal de productos.
// Muestra un resumen de lo que cambió o los errores del archivo, y avisa con un toast

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { importarProductos, type EstadoImportacion } from "@/actions/productos";

export default function FormularioImportacion() {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoImportacion, formData: FormData) => {
      const r = await importarProductos(anterior, formData);
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  return (
    <div className="grid gap-4">
      <form
        action={accion}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          name="archivo"
          type="file"
          required
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label="Excel de productos"
          className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-honeydew file:px-3 file:py-2 file:font-medium file:text-deep-space hover:file:bg-frosted/50"
        />
        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Importando..." : "Subir y actualizar"}
        </button>
      </form>

      {estado?.ok && (
        <div className="rounded-lg bg-honeydew px-4 py-3 text-sm">
          <p className="font-semibold">{estado.mensaje}</p>
          <ul className="mt-1 text-steel">
            <li>{estado.nuevos} nuevos</li>
            <li>{estado.actualizados} actualizados</li>
            <li>
              {estado.desactivados} desactivados (ya no vienen en el Excel)
            </li>
          </ul>
          {estado.avisos.length > 0 && (
            <ul className="mt-2 text-xs text-steel">
              {estado.avisos.slice(0, 10).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {estado?.ok === false && estado.errores.length > 0 && (
        <ul className="rounded-lg bg-strawberry/10 px-4 py-3 text-sm text-strawberry">
          {estado.errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Planilla de conteo de un inventario: una fila por producto con un campo para lo contado.
// Conteo "a ciegas": no se muestra el stock del sistema mientras se cuenta, para no influir en el número.
// "Guardar avance" guarda lo escrito; "Finalizar" guarda y cierra el inventario (luego se ven las diferencias)

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { guardarConteoAccion, type EstadoConteo } from "@/actions/inventario";

type Item = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string | null;
  contado: number | null;
};

export default function FormularioConteo({
  inventarioId,
  items,
}: {
  inventarioId: number;
  items: Item[];
}) {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoConteo, formData: FormData) => {
      const r = await guardarConteoAccion(anterior, formData);
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );
  const errores = estado?.ok === false ? estado.errores : undefined;

  return (
    <form action={accion}>
      <input type="hidden" name="inventarioId" value={inventarioId} />

      <div className="overflow-x-auto rounded-xl border border-frosted bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-deep-space text-xs uppercase tracking-wide text-honeydew">
            <tr>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="w-32 px-4 py-3 text-right font-semibold">
                Contado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-frosted/60">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-honeydew">
                <td className="min-w-48 px-4 py-3">
                  <p className="font-medium leading-snug">{it.nombre}</p>
                  <p className="mt-0.5 font-mono text-xs text-steel">
                    {it.sku}
                  </p>
                </td>
                <td className="px-4 py-3 text-steel">{it.categoria}</td>
                <td className="px-4 py-2 text-right">
                  <input
                    name={`contado-${it.id}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={it.contado ?? ""}
                    aria-label={`Cantidad contada de ${it.nombre}`}
                    className="input w-24 text-right tabular-nums"
                  />
                  {errores?.[it.id] && (
                    <span className="block text-xs text-strawberry">
                      {errores[it.id]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-steel">
        Deja vacío lo que aún no cuentas. El stock del sistema se muestra al
        finalizar, para no influir en el conteo.
      </p>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {/* name/value en el botón: la acción sabe cuál se presionó */}
        <button
          name="intencion"
          value="guardar"
          disabled={pendiente}
          className="rounded-lg border border-deep-space px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Guardar avance
        </button>
        <button
          name="intencion"
          value="finalizar"
          disabled={pendiente}
          onClick={(e) => {
            if (
              !confirm(
                "¿Finalizar el inventario? Después no se podrá modificar.",
              )
            ) {
              e.preventDefault();
            }
          }}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Finalizar inventario"}
        </button>
      </div>
    </form>
  );
}

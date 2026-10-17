// Formulario para generar el inventario de controlados: entran todos, sin azar ni cantidad.
// Si sale bien, la acción redirige a la página del inventario nuevo; si no, avisa con un toast

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import {
  generarControladosAccion,
  type EstadoGenerar,
} from "@/actions/inventario";

export default function FormularioControlados({
  total,
  conStock,
}: {
  total: number;
  conStock: number;
}) {
  const [, accion, pendiente] = useActionState(
    async (anterior: EstadoGenerar, formData: FormData) => {
      const r = await generarControladosAccion(anterior, formData);
      if (r) toast.error(r.mensaje); // si todo sale bien no vuelve: redirige
      return r;
    },
    null,
  );

  return (
    <form action={accion} className="grid gap-4">
      <p className="text-sm text-deep-space">
        Se cuentan <strong>todos</strong> los controlados ({total} productos,{" "}
        {conStock} con stock). Cuenta con cuidado: cualquier diferencia debe
        cuadrar con el libro de controlados. No entran en el inventario del día.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="incluirSinStock"
          defaultChecked
          className="size-4 accent-strawberry"
        />
        Incluir productos con stock 0
      </label>

      <button
        disabled={pendiente}
        className="w-fit rounded-lg bg-strawberry px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-strawberry/90 disabled:opacity-50"
      >
        {pendiente ? "Generando..." : "Generar inventario de controlados"}
      </button>
    </form>
  );
}

// Formulario de vencimiento: registra producto, lote, fecha y cantidad, y avisa el resultado con un toast
// usa BuscadorProducto (para elegir el producto) y Campo (envuelve cada input con su label y error)

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import {
  crearVencimiento,
  type EstadoFormulario,
} from "@/actions/vencimientos";
import BuscadorProducto, {
  type ProductoOpcion,
} from "@/components/buscador-producto";
import Campo from "@/components/campo";

export default function FormularioVencimiento({
  productos,
}: {
  productos: ProductoOpcion[];
}) {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoFormulario, formData: FormData) => {
      const r = await crearVencimiento(anterior, formData);
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  const errores = estado?.ok === false ? estado.errores : undefined;
  const valores = estado?.ok === false ? estado.valores : undefined;

  return (
    <form action={accion} className="grid max-w-md gap-4">
      <BuscadorProducto
        key={estado?.ok ? estado.id : "editando"} // al guardar, el buscador vuelve a empezar
        productos={productos}
        error={errores?.productoId?.[0]}
      />

      <Campo label="Lote" error={errores?.lote?.[0]}>
        <input
          name="lote"
          required
          defaultValue={valores?.lote}
          className="input"
        />
      </Campo>

      <Campo
        label="Fecha de vencimiento"
        error={errores?.fechaVencimiento?.[0]}
      >
        <input
          name="fechaVencimiento"
          type="date"
          required
          defaultValue={valores?.fechaVencimiento}
          className="input"
        />
      </Campo>

      <Campo label="Cantidad" error={errores?.cantidad?.[0]}>
        <input
          name="cantidad"
          type="number"
          min={1}
          required
          defaultValue={valores?.cantidad}
          className="input"
        />
      </Campo>

      <button
        disabled={pendiente}
        className="rounded-lg bg-deep-space px-4 py-2 font-semibold text-honeydew disabled:opacity-50"
      >
        {pendiente ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

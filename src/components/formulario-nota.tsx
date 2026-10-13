// Formulario del post-it: escribe una nota con su autor y avisa el resultado con un toast

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { crearNota, type EstadoNota } from "@/actions/notas";

export default function FormularioNota() {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoNota, formData: FormData) => {
      const r = await crearNota(anterior, formData);
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  const errores = estado?.ok === false ? estado.errores : undefined;
  const valores = estado?.ok === false ? estado.valores : undefined;

  return (
    <form
      action={accion}
      key={estado?.ok ? estado.id : "editando"} // al guardar, el formulario queda limpio
      className="grid gap-2 border-t border-dashed border-frosted px-6 py-4"
    >
      <textarea
        name="contenido"
        required
        rows={2}
        maxLength={1000}
        placeholder="Escribe la nota del día..."
        defaultValue={valores?.contenido}
        aria-label="Nota"
        className="resize-none rounded-md bg-honeydew/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-frosted"
      />
      {errores?.contenido && (
        <span className="text-xs text-strawberry">{errores.contenido[0]}</span>
      )}
      <div className="flex gap-2">
        <input
          name="autor"
          required
          maxLength={60}
          placeholder="Tu nombre"
          defaultValue={valores?.autor}
          aria-label="Autor"
          className="min-w-0 flex-1 rounded-md bg-honeydew/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-frosted"
        />
        <button
          disabled={pendiente}
          className="rounded-md bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Publicar"}
        </button>
      </div>
      {errores?.autor && (
        <span className="text-xs text-strawberry">{errores.autor[0]}</span>
      )}
    </form>
  );
}

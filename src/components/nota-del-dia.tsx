// Nota del día dentro del post-it: muestra el texto, su autor y quién la editó.
// Con "Editar" se cambia el texto en el mismo lugar; cada edición guarda quién la hizo y cómo decía antes.
// Las fechas llegan ya formateadas desde el servidor, así no dependen de la zona horaria del navegador.

"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { editarNotaAccion, type EstadoEdicionNota } from "@/actions/notas";

export type EdicionNota = {
  id: number;
  editor: string;
  contenidoAnterior: string;
  fecha: string;
};

export default function NotaDelDia({
  nota,
  ediciones,
}: {
  nota: {
    id: number;
    contenido: string;
    autor: string;
    fecha: string;
    fechaISO: string;
  };
  ediciones: EdicionNota[]; // la más reciente primero
}) {
  const [editando, setEditando] = useState(false);
  const [verCambios, setVerCambios] = useState(false);

  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoEdicionNota, formData: FormData) => {
      const r = await editarNotaAccion(anterior, formData);
      if (r?.ok) {
        toast.success(r.mensaje);
        setEditando(false);
      } else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );
  const errores = estado?.ok === false ? estado.errores : undefined;

  if (editando) {
    return (
      <form action={accion} className="grid gap-2">
        <input type="hidden" name="id" value={nota.id} />
        <textarea
          name="contenido"
          required
          rows={5}
          maxLength={1000}
          defaultValue={nota.contenido}
          aria-label="Nota"
          autoFocus
          className="resize-none rounded-md bg-honeydew/60 px-3 py-2 text-center text-xl font-semibold leading-snug outline-none focus:ring-2 focus:ring-frosted"
        />
        {errores?.contenido && (
          <span className="text-xs text-strawberry">
            {errores.contenido[0]}
          </span>
        )}
        <div className="flex gap-2">
          <input
            name="editor"
            required
            maxLength={60}
            placeholder="¿Quién edita?"
            aria-label="Quién edita"
            className="min-w-0 flex-1 rounded-md bg-honeydew/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-frosted"
          />
          <button
            type="button"
            disabled={pendiente}
            onClick={() => setEditando(false)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-steel hover:bg-honeydew disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={pendiente}
            className="rounded-md bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
          >
            {pendiente ? "Guardando..." : "Guardar"}
          </button>
        </div>
        {errores?.editor && (
          <span className="text-xs text-strawberry">{errores.editor[0]}</span>
        )}
      </form>
    );
  }

  const ultima = ediciones[0];

  return (
    <>
      {/* whitespace-pre-wrap: respeta los saltos de línea que escribió */}
      <p className="whitespace-pre-wrap break-words text-center text-2xl font-semibold leading-snug sm:text-3xl">
        {nota.contenido}
      </p>
      <p className="mt-6 text-center text-sm text-steel">
        — {nota.autor} · <time dateTime={nota.fechaISO}>{nota.fecha}</time>
      </p>
      {ultima && (
        <p className="mt-1 text-center text-xs text-steel">
          Editada por {ultima.editor} · {ultima.fecha}
        </p>
      )}

      <div className="mt-3 flex justify-center gap-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="flex items-center gap-1 text-steel underline-offset-2 hover:text-deep-space hover:underline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
            aria-hidden
          >
            <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />
          </svg>
          Editar
        </button>
        {ediciones.length > 0 && (
          <button
            type="button"
            onClick={() => setVerCambios((v) => !v)}
            aria-expanded={verCambios}
            className="text-steel underline-offset-2 hover:text-deep-space hover:underline"
          >
            {verCambios
              ? "Ocultar cambios"
              : `Ver cambios (${ediciones.length})`}
          </button>
        )}
      </div>

      {verCambios && (
        // cada edición muestra cómo decía la nota antes de que esa persona la cambiara
        <ol className="mt-3 grid gap-2 border-t border-dashed border-frosted pt-3 text-left">
          {ediciones.map((e) => (
            <li key={e.id} className="text-xs">
              <p className="text-steel">
                {e.fecha} · editada por <b>{e.editor}</b>. Antes decía:
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words rounded bg-honeydew/60 px-2 py-1 text-sm text-deep-space/80">
                {e.contenidoAnterior}
              </p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

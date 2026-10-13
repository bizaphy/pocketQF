// Botón de la tabla de vencimientos: abre un pop-up con el lote, la fecha y la cantidad para corregirlos.
// Al guardar, "Última revisión" queda con la fecha y hora actual. El producto no se cambia aquí.

"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import {
  editarVencimiento,
  type EstadoFormulario,
} from "@/actions/vencimientos";
import Campo from "@/components/campo";

type VencimientoEditable = {
  id: number;
  nombre: string;
  lote: string;
  fechaVencimiento: string; // "YYYY-MM-DD", el formato que usa <input type="date">
  cantidad: number;
};

export default function BotonEditarVencimiento({
  vencimiento: v,
}: {
  vencimiento: VencimientoEditable;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  // cambia cada vez que se abre: el formulario se vuelve a montar con los datos actuales y sin errores viejos
  const [apertura, setApertura] = useState(0);

  function abrir() {
    setApertura((n) => n + 1);
    dialogo.current?.showModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label={`Editar lote ${v.lote} de ${v.nombre}`}
        title="Editar"
        className="rounded-md p-1.5 text-steel transition-colors hover:bg-frosted/40 hover:text-deep-space"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden
        >
          <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />
        </svg>
      </button>

      <dialog
        ref={dialogo}
        // clic en el fondo oscuro (fuera del cuadro) cierra el pop-up
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[min(28rem,calc(100%-2rem))] whitespace-normal rounded-xl bg-white p-0 text-left text-deep-space shadow-xl backdrop:bg-deep-space/40"
      >
        <FormularioEdicion
          key={apertura}
          v={v}
          cerrar={() => dialogo.current?.close()}
        />
      </dialog>
    </>
  );
}

function FormularioEdicion({
  v,
  cerrar,
}: {
  v: VencimientoEditable;
  cerrar: () => void;
}) {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoFormulario, formData: FormData) => {
      const r = await editarVencimiento(anterior, formData);
      if (r?.ok) {
        toast.success(r.mensaje);
        cerrar();
      } else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  const errores = estado?.ok === false ? estado.errores : undefined;
  const valores = estado?.ok === false ? estado.valores : undefined;

  return (
    <form action={accion} className="grid gap-4 p-6">
      <div>
        <h2 className="text-lg font-bold">Editar vencimiento</h2>
        <p className="mt-1 text-sm text-steel">{v.nombre}</p>
      </div>

      <input type="hidden" name="id" value={v.id} />

      <Campo label="Lote" error={errores?.lote?.[0]}>
        <input
          name="lote"
          required
          defaultValue={valores?.lote ?? v.lote}
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
          defaultValue={valores?.fechaVencimiento ?? v.fechaVencimiento}
          className="input"
        />
      </Campo>

      <Campo label="Cantidad" error={errores?.cantidad?.[0]}>
        <input
          name="cantidad"
          type="number"
          min={1}
          required
          defaultValue={valores?.cantidad ?? v.cantidad}
          className="input"
        />
      </Campo>

      <p className="text-xs text-steel">
        Al guardar, «Última revisión» se actualiza a este momento.
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={cerrar}
          className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-honeydew disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

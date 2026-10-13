// Botón de la tabla de vencimientos: abre un pop-up para confirmar y, si se acepta, borra el lote
// usa <dialog> del navegador: showModal() lo muestra encima de todo, con fondo oscuro y Esc para cerrar

"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { borrarVencimiento } from "@/actions/vencimientos";

export default function BotonEliminarVencimiento({
  id,
  nombre,
  lote,
}: {
  id: number;
  nombre: string;
  lote: string;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [pendiente, iniciar] = useTransition();

  function confirmar() {
    iniciar(async () => {
      const r = await borrarVencimiento(id);
      if (r.ok) toast.success(r.mensaje);
      else toast.error(r.mensaje);
      dialogo.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        aria-label={`Eliminar lote ${lote} de ${nombre}`}
        title="Eliminar"
        className="rounded-md p-1.5 text-steel transition-colors hover:bg-strawberry/10 hover:text-strawberry"
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
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>

      <dialog
        ref={dialogo}
        // clic en el fondo oscuro (fuera del cuadro) cierra el pop-up
        onClick={(e) => {
          if (e.target === e.currentTarget && !pendiente)
            e.currentTarget.close();
        }}
        className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-xl bg-white p-0 text-left text-deep-space shadow-xl backdrop:bg-deep-space/40"
      >
        <div className="p-6">
          <h2 className="text-lg font-bold">¿Eliminar este vencimiento?</h2>
          <p className="mt-2 text-sm text-steel">
            Se borrará el lote <b className="font-mono">{lote}</b> de{" "}
            <b>{nombre}</b>. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              autoFocus // el foco parte en Cancelar: Enter no borra por accidente
              disabled={pendiente}
              onClick={() => dialogo.current?.close()}
              className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-honeydew disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={confirmar}
              className="rounded-lg bg-strawberry px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pendiente ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

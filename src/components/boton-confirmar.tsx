// Botón que pide confirmación en un pop-up antes de ejecutar una acción que borra algo.
// Igual que el de vencimientos, pero genérico: recibe la acción ya armada (ej: borrarZona.bind(null, id))
// y, si se indica, a dónde ir después de borrar.

"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

export default function BotonConfirmar({
  texto,
  titulo,
  descripcion,
  accion,
  irA,
}: {
  texto: string; // texto del botón y de la confirmación (ej: "Eliminar zona")
  titulo: string;
  descripcion: React.ReactNode;
  accion: () => Promise<{ ok: boolean; mensaje: string }>;
  irA?: string;
}) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [pendiente, iniciar] = useTransition();

  function confirmar() {
    iniciar(async () => {
      const r = await accion();
      if (r.ok) {
        toast.success(r.mensaje);
        if (irA) router.push(irA);
      } else toast.error(r.mensaje);
      dialogo.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-strawberry transition-colors hover:bg-strawberry/10"
      >
        {texto}
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
          <h2 className="text-lg font-bold">{titulo}</h2>
          <p className="mt-2 text-sm text-steel">{descripcion}</p>
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
              {pendiente ? "Eliminando..." : texto}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

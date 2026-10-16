// Crea o edita una ficha de Pocket QF.
// Sin `ficha`: solo pide el principio activo y los términos, y al guardar lleva a la ficha nueva para completarla.
// Con `ficha`: edita todos los campos.

"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import {
  crearFichaAccion,
  editarFichaAccion,
  type EstadoFicha,
} from "@/actions/pocket-qf";
import Campo from "@/components/campo";
import type { Ficha } from "@/db/schema";

export default function FormularioFicha({ ficha }: { ficha?: Ficha }) {
  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoFicha, formData: FormData) => {
      const r = ficha
        ? await editarFichaAccion(anterior, formData)
        : await crearFichaAccion(anterior, formData); // si sale bien, redirige
      if (r?.ok) toast.success(r.mensaje);
      else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );
  const errores = estado?.errores;

  return (
    <form action={accion} className="grid min-w-0 gap-4">
      {ficha && <input type="hidden" name="id" value={ficha.id} />}

      <Campo label="Principio activo" error={errores?.principioActivo?.[0]}>
        <input
          name="principioActivo"
          required
          minLength={3}
          maxLength={80}
          defaultValue={ficha?.principioActivo}
          placeholder="Ej: Escitalopram"
          className="input w-full min-w-0"
        />
      </Campo>

      <Campo label="Otros nombres (opcional)" error={errores?.terminos?.[0]}>
        <input
          name="terminos"
          maxLength={400}
          defaultValue={ficha?.terminos ?? ""}
          placeholder="Ej: hiocina, butilbromuro, -crema"
          className="input w-full min-w-0"
        />
        <span className="text-xs font-normal text-steel">
          Separados por coma. Sirven si el nombre del producto lo escribe de
          otra forma. Con guion adelante se excluye: ej. “-crema” deja fuera los
          productos con “crema” en el nombre.
        </span>
      </Campo>

      {ficha && (
        <>
          <Campo
            label="Diagnóstico o uso típico"
            error={errores?.indicaciones?.[0]}
          >
            <textarea
              name="indicaciones"
              rows={3}
              maxLength={2000}
              defaultValue={ficha.indicaciones ?? ""}
              placeholder="Ej: depresión, trastorno de ansiedad"
              className="input w-full min-w-0"
            />
          </Campo>
          <Campo
            label="Efectos secundarios frecuentes"
            error={errores?.efectosSecundarios?.[0]}
          >
            <textarea
              name="efectosSecundarios"
              rows={3}
              maxLength={2000}
              defaultValue={ficha.efectosSecundarios ?? ""}
              placeholder="Ej: náuseas, dolor de cabeza, insomnio"
              className="input w-full min-w-0"
            />
          </Campo>
          <Campo
            label="Precauciones y consejos"
            error={errores?.observaciones?.[0]}
          >
            <textarea
              name="observaciones"
              rows={3}
              maxLength={2000}
              defaultValue={ficha.observaciones ?? ""}
              placeholder="Ej: tomar siempre a la misma hora; no suspender de golpe"
              className="input w-full min-w-0"
            />
          </Campo>
        </>
      )}

      <div>
        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : ficha ? "Guardar ficha" : "Crear ficha"}
        </button>
      </div>
    </form>
  );
}

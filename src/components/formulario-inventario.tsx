// Formulario para generar el inventario del día: al azar (por defecto) o solo de una categoría.
// Si sale bien, la acción redirige a la página del inventario nuevo; si no, avisa con un toast

"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import {
  generarInventarioAccion,
  type EstadoGenerar,
} from "@/actions/inventario";
import Campo from "@/components/campo";

export default function FormularioInventario({
  categorias,
}: {
  categorias: { categoria: string; productos: number }[];
}) {
  const [modo, setModo] = useState<"azar" | "categoria">("azar");

  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoGenerar, formData: FormData) => {
      const r = await generarInventarioAccion(anterior, formData);
      if (r) toast.error(r.mensaje); // si todo sale bien no vuelve: redirige
      return r;
    },
    null,
  );
  const errores = estado?.errores;

  return (
    <form action={accion} className="grid gap-4">
      {/* modo: dos botones tipo "pestaña" que marcan un radio */}
      <fieldset className="grid gap-1 text-sm font-medium">
        <legend className="mb-1">Productos a contar</legend>
        <div className="inline-flex w-fit rounded-lg border border-frosted p-0.5">
          {(
            [
              ["azar", "Al azar"],
              ["categoria", "Por categoría"],
            ] as const
          ).map(([valor, texto]) => (
            <label
              key={valor}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-colors ${modo === valor ? "bg-deep-space text-honeydew" : "text-steel hover:text-deep-space"}`}
            >
              <input
                type="radio"
                name="modo"
                value={valor}
                checked={modo === valor}
                onChange={() => setModo(valor)}
                className="sr-only"
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>

      {modo === "categoria" && (
        <Campo label="Categoría" error={errores?.categoria?.[0]}>
          <select name="categoria" required defaultValue="" className="input">
            <option value="" disabled>
              Elige una categoría
            </option>
            {categorias.map((c) => (
              <option key={c.categoria} value={c.categoria}>
                {c.categoria} ({c.productos})
              </option>
            ))}
          </select>
        </Campo>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Cantidad de productos" error={errores?.cantidad?.[0]}>
          <input
            name="cantidad"
            type="number"
            min={1}
            max={200}
            required
            defaultValue={20}
            className="input"
          />
        </Campo>
        <Campo
          label="No repetir los contados en los últimos (días)"
          error={errores?.diasSinRepetir?.[0]}
        >
          <input
            name="diasSinRepetir"
            type="number"
            min={0}
            max={365}
            required
            defaultValue={30}
            className="input"
          />
        </Campo>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="incluirSinStock"
          className="size-4 accent-deep-space"
        />
        Incluir productos con stock 0
      </label>

      <button
        disabled={pendiente}
        className="w-fit rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
      >
        {pendiente ? "Generando..." : "Generar inventario"}
      </button>
    </form>
  );
}

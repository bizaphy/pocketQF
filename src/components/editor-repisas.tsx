// Repisas de un mueble: cada una con su ubicación completa y lo que guarda
// (ej: "SALA DE VENTAS - Estante 1 (sala), Repisa 2" → "Oftálmicos").
// Se editan en la misma fila; abajo se agrega una nueva.

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { borrarRepisa, guardarRepisa } from "@/actions/ubicaciones";

type Repisa = { id: number; numero: number; contenido: string };
type Errores = Record<string, string[] | undefined> | undefined;

export default function EditorRepisas({
  estanteId,
  etiqueta,
  repisas,
  sugerencias,
}: {
  estanteId: number;
  etiqueta: string; // "SALA DE VENTAS - Estante 1 (sala)"
  repisas: Repisa[];
  sugerencias: string[]; // categorías de productos, para autocompletar
}) {
  const [editando, setEditando] = useState<number | null>(null);
  const siguiente = Math.max(0, ...repisas.map((r) => r.numero)) + 1;

  return (
    <div className="grid gap-3">
      <datalist id="sugerencias-repisa">
        {sugerencias.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {repisas.length === 0 && (
        <p className="text-sm text-steel">
          Este mueble todavía no tiene repisas. Agrega la primera abajo.
        </p>
      )}

      <ul className="grid gap-2">
        {repisas.map((r) =>
          editando === r.id ? (
            <li
              key={r.id}
              className="rounded-xl border border-frosted bg-white p-4 shadow-sm"
            >
              <FilaFormulario
                estanteId={estanteId}
                repisa={r}
                alTerminar={() => setEditando(null)}
              />
            </li>
          ) : (
            <FilaRepisa
              key={r.id}
              repisa={r}
              etiqueta={etiqueta}
              alEditar={() => setEditando(r.id)}
            />
          ),
        )}
      </ul>

      <div className="rounded-xl border border-dashed border-frosted p-4">
        <p className="mb-2 text-sm font-semibold">Agregar repisa</p>
        {/* key: al guardar cambia el número sugerido y el formulario se limpia */}
        <FilaFormulario
          key={siguiente}
          estanteId={estanteId}
          numeroSugerido={siguiente}
        />
      </div>
    </div>
  );
}

function FilaRepisa({
  repisa,
  etiqueta,
  alEditar,
}: {
  repisa: Repisa;
  etiqueta: string;
  alEditar: () => void;
}) {
  const [pendiente, iniciar] = useTransition();

  function borrar() {
    if (!confirm(`¿Eliminar la repisa ${repisa.numero}?`)) return;
    iniciar(async () => {
      const r = await borrarRepisa(repisa.id);
      if (r.ok) toast.success(r.mensaje);
      else toast.error(r.mensaje);
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-frosted bg-white p-4 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-moss/15 text-lg font-bold text-moss">
        {repisa.numero}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">
          {etiqueta}, Repisa {repisa.numero}
        </p>
        <p className="text-lg font-semibold">{repisa.contenido}</p>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={alEditar}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-honeydew"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={borrar}
          disabled={pendiente}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-strawberry hover:bg-strawberry/10 disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

// crea (sin repisa) o edita (con repisa) una repisa
function FilaFormulario({
  estanteId,
  repisa,
  numeroSugerido,
  alTerminar,
}: {
  estanteId: number;
  repisa?: Repisa;
  numeroSugerido?: number;
  alTerminar?: () => void;
}) {
  const [errores, setErrores] = useState<Errores>();
  const [pendiente, iniciar] = useTransition();

  // onSubmit y no action: con action, React vacía el formulario aunque haya error
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const formData = new FormData(formulario);
    iniciar(async () => {
      const r = await guardarRepisa({
        estanteId,
        id: repisa?.id,
        numero: String(formData.get("numero") ?? ""),
        contenido: String(formData.get("contenido") ?? ""),
      });
      if (!r) return;
      setErrores(r.errores);
      if (r.ok) {
        toast.success(r.mensaje);
        if (alTerminar) alTerminar();
        else formulario.reset(); // repisa nueva: limpiar para la siguiente
      } else toast.error(r.mensaje);
    });
  }

  const error = errores?.numero?.[0] ?? errores?.contenido?.[0];

  return (
    <form onSubmit={enviar} className="grid gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs font-medium text-steel">
          N°
          <input
            name="numero"
            type="number"
            min={1}
            max={50}
            required
            defaultValue={repisa?.numero ?? numeroSugerido}
            className="input w-20 text-sm text-deep-space"
          />
        </label>
        <label className="grid min-w-48 flex-1 gap-1 text-xs font-medium text-steel">
          Contenido
          <input
            name="contenido"
            required
            maxLength={120}
            list="sugerencias-repisa"
            defaultValue={repisa?.contenido}
            placeholder="Ej: Oftálmicos"
            autoFocus={!!repisa}
            className="input text-sm text-deep-space"
          />
        </label>
        <div className="flex gap-1">
          <button
            disabled={pendiente}
            className="rounded-lg bg-deep-space px-3 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
          >
            {pendiente ? "Guardando..." : repisa ? "Guardar" : "+ Agregar"}
          </button>
          {alTerminar && (
            <button
              type="button"
              onClick={alTerminar}
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-honeydew"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      {error && <span className="text-xs text-strawberry">{error}</span>}
    </form>
  );
}

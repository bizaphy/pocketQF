// Crea una tarea periódica o fortuita. La lista de tareas predefinidas llena el título
// (y la frecuencia, si es periódica) para no escribir todo a mano; igual se puede editar.

"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { crearTarea, type EstadoTarea } from "@/actions/tareas";
import Campo from "@/components/campo";
import {
  PERIODOS,
  PLANTILLAS_FORTUITAS,
  PLANTILLAS_PERIODICAS,
  type Periodo,
} from "@/lib/plantillas-tareas";

type Tipo = "periodica" | "fortuita";

const PESTANAS: { valor: Tipo; texto: string }[] = [
  { valor: "periodica", texto: "Periódica" },
  { valor: "fortuita", texto: "Fortuita" },
];

export default function FormularioTarea() {
  const [tipo, setTipo] = useState<Tipo>("periodica");
  const [plantilla, setPlantilla] = useState(""); // índice elegido en la lista, "" = escribir a mano
  const [titulo, setTitulo] = useState("");
  const [veces, setVeces] = useState("1");
  const [periodo, setPeriodo] = useState<Periodo>("semana");

  function limpiar() {
    setPlantilla("");
    setTitulo("");
    setVeces("1");
    setPeriodo("semana");
  }

  const [estado, accion, pendiente] = useActionState(
    async (anterior: EstadoTarea, formData: FormData) => {
      const r = await crearTarea(anterior, formData);
      if (r?.ok) {
        toast.success(r.mensaje);
        limpiar();
      } else if (r) toast.error(r.mensaje);
      return r;
    },
    null,
  );

  const errores = estado?.ok === false ? estado.errores : undefined;
  const ejemploDetalle =
    tipo === "fortuita" && plantilla !== ""
      ? PLANTILLAS_FORTUITAS[Number(plantilla)].ejemplo
      : "Ej: proveedor, cliente o producto";

  function elegirPlantilla(valor: string) {
    setPlantilla(valor);
    if (valor === "") return;
    if (tipo === "periodica") {
      const p = PLANTILLAS_PERIODICAS[Number(valor)];
      setTitulo(p.titulo);
      setVeces(String(p.veces));
      setPeriodo(p.periodo);
    } else {
      setTitulo(PLANTILLAS_FORTUITAS[Number(valor)].titulo);
    }
  }

  function cambiarTipo(nuevo: Tipo) {
    setTipo(nuevo);
    limpiar();
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      {/* pestañas: periódica o fortuita */}
      <div className="grid grid-cols-2 rounded-lg bg-honeydew p-1 text-sm font-semibold">
        {PESTANAS.map((p) => (
          <button
            key={p.valor}
            type="button"
            onClick={() => cambiarTipo(p.valor)}
            aria-pressed={tipo === p.valor}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              tipo === p.valor
                ? "bg-white text-deep-space shadow-sm"
                : "text-steel hover:text-deep-space"
            }`}
          >
            {p.texto}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-xs text-steel">
        {tipo === "periodica"
          ? "Se repite cada cierto tiempo (ej: 2 veces por semana)."
          : "Se hace una sola vez (ej: enviar una devolución al proveedor)."}
      </p>

      <form
        action={accion}
        key={estado?.ok ? estado.id : "editando"} // al guardar, los campos sin estado quedan limpios
        className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4"
      >
        <input type="hidden" name="tipo" value={tipo} />

        <Campo label="Elegir de la lista">
          <select
            value={plantilla}
            onChange={(e) => elegirPlantilla(e.target.value)}
            className="input h-10 w-full min-w-0"
          >
            <option value="">Escribir otra tarea...</option>
            {(tipo === "periodica"
              ? PLANTILLAS_PERIODICAS
              : PLANTILLAS_FORTUITAS
            ).map((p, i) => (
              <option key={p.titulo} value={i}>
                {p.titulo}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label="Tarea" error={errores?.titulo?.[0]}>
          <input
            name="titulo"
            required
            maxLength={100}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Limpieza de mesón"
            className="input h-10 w-full min-w-0"
          />
        </Campo>

        {tipo === "periodica" && (
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-2">
            <Campo label="Veces" error={errores?.veces?.[0]}>
              <input
                name="veces"
                type="number"
                required
                min={1}
                max={20}
                value={veces}
                onChange={(e) => setVeces(e.target.value)}
                className="input h-10 w-full min-w-0"
              />
            </Campo>
            <Campo label="Cada" error={errores?.periodo?.[0]}>
              <select
                name="periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as Periodo)}
                className="input h-10 w-full min-w-0"
              >
                {Object.entries(PERIODOS).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        )}

        <Campo label="Detalle (opcional)" error={errores?.detalle?.[0]}>
          <textarea
            name="detalle"
            rows={2}
            maxLength={200}
            placeholder={ejemploDetalle}
            className="input w-full min-w-0 resize-none"
          />
        </Campo>

        {tipo === "fortuita" && (
          <Campo
            label="Fecha límite (opcional)"
            error={errores?.fechaLimite?.[0]}
          >
            <input
              name="fechaLimite"
              type="date"
              className="input h-10 w-full min-w-0"
            />
          </Campo>
        )}

        <button
          disabled={pendiente}
          className="rounded-lg bg-deep-space px-4 py-2 text-sm font-semibold text-honeydew disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Crear tarea"}
        </button>
      </form>
    </div>
  );
}

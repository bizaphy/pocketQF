// Mapa de una zona de la farmacia dibujado en una cuadrícula (SVG).
// Modo "ver": tocar un mueble abre su ficha con las repisas.
// Modo "editar": agregar muebles, arrastrarlos, cambiarles el tamaño desde la esquina y rotarlos.
// Los cambios se ven al instante y se guardan en el servidor al soltar; si el servidor
// los rechaza (choque con otro mueble), el mueble vuelve a donde estaba.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { agregarEstante, guardarPosicion } from "@/actions/ubicaciones";
import {
  COLUMNAS,
  FILAS,
  TIPOS,
  etiquetaUbicacion,
  limitar,
  nombreMueble,
  normalizar,
  posicionLibre,
  type Rect,
  type TipoMueble,
} from "@/lib/mapa";

export type MuebleMapa = Rect & {
  id: number;
  nombre: string;
  detalle: string | null;
  tipo: TipoMueble;
  repisas: { id: number; numero: number; contenido: string }[];
};

const CELDA = 40; // px de cada celda dentro del viewBox

// clases completas para Tailwind (no detecta clases armadas con variables)
const ESTILO_TIPO: Record<TipoMueble, string> = {
  estante: "fill-frosted/50 stroke-steel",
  vitrina: "fill-lavender/20 stroke-lavender",
  refrigerador: "fill-steel/20 stroke-deep-space",
  meson: "fill-saffron/30 stroke-saffron",
};

type Arrastre = {
  id: number;
  accion: "mover" | "redimensionar";
  inicio: { x: number; y: number }; // punto del puntero al empezar, en unidades del SVG
  original: Rect;
};

const rectDe = (m: Rect): Rect => ({
  x: m.x,
  y: m.y,
  ancho: m.ancho,
  alto: m.alto,
});
const mismoRect = (a: Rect, b: Rect) =>
  a.x === b.x && a.y === b.y && a.ancho === b.ancho && a.alto === b.alto;

export default function MapaUbicaciones({
  zona,
  muebles: iniciales,
  editarInicial = false,
}: {
  zona: { id: number; nombre: string };
  muebles: MuebleMapa[];
  editarInicial?: boolean;
}) {
  const router = useRouter();
  const svg = useRef<SVGSVGElement>(null);
  const arrastre = useRef<Arrastre | null>(null);
  const [muebles, setMuebles] = useState(iniciales);
  const [editando, setEditando] = useState(editarInicial);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [tipoNuevo, setTipoNuevo] = useState<TipoMueble>("estante");
  const [busqueda, setBusqueda] = useState("");
  const [pendiente, iniciar] = useTransition();

  const elegido = muebles.find((m) => m.id === seleccionado);

  // búsqueda en nombres y contenido de repisas, sin importar tildes ni mayúsculas
  const q = normalizar(busqueda);
  const coincide = (m: MuebleMapa) =>
    normalizar(nombreMueble(m)).includes(q) ||
    m.repisas.some((r) => normalizar(r.contenido).includes(q));
  const encontrados = q ? muebles.filter(coincide) : [];

  function cambiar(id: number, rect: Rect) {
    setMuebles((lista) =>
      lista.map((m) => (m.id === id ? { ...m, ...rect } : m)),
    );
  }

  // guarda en el servidor; si falla, deshace el cambio
  function guardar(id: number, rect: Rect, anterior: Rect) {
    if (!posicionLibre(rect, muebles, id)) {
      cambiar(id, anterior);
      toast.error("Ahí no cabe: se sale del mapa o pisa otro mueble");
      return;
    }
    cambiar(id, rect);
    iniciar(async () => {
      const r = await guardarPosicion(id, rect);
      if (!r.ok) {
        cambiar(id, anterior);
        toast.error(r.mensaje);
      }
    });
  }

  // posición del puntero en unidades del SVG (el SVG se escala con la pantalla)
  function punto(e: React.PointerEvent) {
    const matriz = svg.current?.getScreenCTM()?.inverse();
    if (!matriz) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matriz);
    return { x: p.x, y: p.y };
  }

  function empezar(
    e: React.PointerEvent,
    m: MuebleMapa,
    accion: Arrastre["accion"],
  ) {
    if (!editando || e.button !== 0) return;
    e.stopPropagation();
    svg.current?.setPointerCapture(e.pointerId); // seguir el puntero aunque salga del mueble
    arrastre.current = {
      id: m.id,
      accion,
      inicio: punto(e),
      original: rectDe(m),
    };
    setSeleccionado(m.id);
  }

  function mover(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a) return;
    const p = punto(e);
    const dx = Math.round((p.x - a.inicio.x) / CELDA);
    const dy = Math.round((p.y - a.inicio.y) / CELDA);
    const o = a.original;
    cambiar(
      a.id,
      a.accion === "mover"
        ? {
            ...o,
            x: limitar(o.x + dx, 0, COLUMNAS - o.ancho),
            y: limitar(o.y + dy, 0, FILAS - o.alto),
          }
        : {
            ...o,
            ancho: limitar(o.ancho + dx, 1, COLUMNAS - o.x),
            alto: limitar(o.alto + dy, 1, FILAS - o.y),
          },
    );
  }

  function soltar() {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    const m = muebles.find((x) => x.id === a.id);
    if (m && !mismoRect(m, a.original)) guardar(a.id, rectDe(m), a.original);
  }

  function rotar(m: MuebleMapa) {
    guardar(m.id, { x: m.x, y: m.y, ancho: m.alto, alto: m.ancho }, rectDe(m));
  }

  function agregar() {
    iniciar(async () => {
      const r = await agregarEstante(zona.id, tipoNuevo);
      if (!r.ok) {
        toast.error(r.mensaje);
        return;
      }
      setMuebles((lista) => [...lista, r.estante]);
      setSeleccionado(r.estante.id);
      toast.success(`${r.estante.nombre} agregado`);
    });
  }

  function teclado(e: React.KeyboardEvent, m: MuebleMapa) {
    if (!editando) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(`/ubicaciones/${m.id}`);
      }
      return;
    }
    // en edición, las flechas mueven el mueble una celda
    const paso = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[e.key];
    if (!paso) return;
    e.preventDefault();
    guardar(
      m.id,
      { ...rectDe(m), x: m.x + paso[0], y: m.y + paso[1] },
      rectDe(m),
    );
  }

  const boton =
    "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="grid gap-4">
      {/* barra de herramientas */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-frosted bg-white p-0.5">
          <button
            type="button"
            onClick={() => {
              setEditando(false);
              setSeleccionado(null);
            }}
            aria-pressed={!editando}
            className={`${boton} ${!editando ? "bg-deep-space text-honeydew" : "hover:bg-honeydew"}`}
          >
            Ver
          </button>
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-pressed={editando}
            className={`${boton} ${editando ? "bg-deep-space text-honeydew" : "hover:bg-honeydew"}`}
          >
            Editar mapa
          </button>
        </div>

        {editando ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={tipoNuevo}
              onChange={(e) => setTipoNuevo(e.target.value as TipoMueble)}
              aria-label="Tipo de mueble"
              className="input py-1.5 text-sm"
            >
              {Object.entries(TIPOS).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={agregar}
              disabled={pendiente}
              className={`${boton} bg-moss text-white hover:bg-moss/90`}
            >
              + Agregar
            </button>
          </div>
        ) : (
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en repisas (ej: oftálmicos)"
            aria-label="Buscar en repisas"
            className="input min-w-0 flex-1 py-1.5 text-sm sm:max-w-xs"
          />
        )}
        {pendiente && <span className="text-xs text-steel">Guardando...</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-frosted bg-white p-2 shadow-sm">
        <svg
          ref={svg}
          viewBox={`0 0 ${COLUMNAS * CELDA} ${FILAS * CELDA}`}
          className={`block w-full min-w-[640px] select-none ${editando ? "touch-none" : ""}`}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
          onPointerDown={() => editando && setSeleccionado(null)} // clic en el piso: deselecciona
          role="img"
          aria-label={`Mapa de ${zona.nombre}`}
        >
          <defs>
            <pattern
              id="cuadricula"
              width={CELDA}
              height={CELDA}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${CELDA} 0 L 0 0 0 ${CELDA}`}
                fill="none"
                className={editando ? "stroke-frosted" : "stroke-frosted/40"}
                strokeWidth={1}
              />
            </pattern>
          </defs>
          <rect
            width={COLUMNAS * CELDA}
            height={FILAS * CELDA}
            fill="url(#cuadricula)"
            className="stroke-frosted"
            strokeWidth={2}
          />

          {muebles.map((m) => {
            const activo = m.id === seleccionado;
            const atenuado = q !== "" && !coincide(m);
            const vertical = m.alto > m.ancho;
            return (
              <g
                key={m.id}
                role={editando ? "button" : "link"}
                tabIndex={0}
                aria-label={`${nombreMueble(m)}, ${m.repisas.length} repisas`}
                onKeyDown={(e) => teclado(e, m)}
                onFocus={() => editando && setSeleccionado(m.id)}
                onPointerDown={(e) => empezar(e, m, "mover")}
                onClick={() => !editando && router.push(`/ubicaciones/${m.id}`)}
                className={`outline-none transition-opacity ${atenuado ? "opacity-25" : ""} ${
                  editando ? "cursor-move" : "cursor-pointer"
                } group`}
              >
                <title>
                  {[
                    nombreMueble(m),
                    ...m.repisas.map(
                      (r) => `Repisa ${r.numero}: ${r.contenido}`,
                    ),
                  ].join("\n")}
                </title>
                <rect
                  x={m.x * CELDA + 2}
                  y={m.y * CELDA + 2}
                  width={m.ancho * CELDA - 4}
                  height={m.alto * CELDA - 4}
                  rx={6}
                  strokeWidth={activo || (q && !atenuado) ? 3 : 1.5}
                  className={`${ESTILO_TIPO[m.tipo]} ${
                    q && !atenuado ? "stroke-strawberry!" : ""
                  } ${activo ? "stroke-deep-space!" : ""} group-hover:brightness-95 group-focus-visible:stroke-deep-space!`}
                />
                {/* HTML dentro del SVG para que el nombre se corte con "…" si no cabe */}
                <foreignObject
                  x={m.x * CELDA + 4}
                  y={m.y * CELDA + 4}
                  width={m.ancho * CELDA - 8}
                  height={m.alto * CELDA - 8}
                  className="pointer-events-none"
                >
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center overflow-hidden text-center leading-tight text-deep-space ${
                      vertical ? "[writing-mode:vertical-rl] rotate-180" : ""
                    }`}
                  >
                    <span className="max-w-full truncate text-[13px] font-semibold">
                      {nombreMueble(m)}
                    </span>
                    {(vertical ? m.alto : m.ancho) >= 3 &&
                      Math.min(m.ancho, m.alto) >= 1 && (
                        <span className="max-w-full truncate text-[11px] text-steel">
                          {m.repisas.length === 0
                            ? "sin repisas"
                            : m.repisas.map((r) => r.contenido).join(" · ")}
                        </span>
                      )}
                  </div>
                </foreignObject>
                {editando && activo && (
                  // esquina inferior derecha: arrastrar cambia el tamaño
                  <rect
                    x={(m.x + m.ancho) * CELDA - 14}
                    y={(m.y + m.alto) * CELDA - 14}
                    width={12}
                    height={12}
                    rx={2}
                    className="cursor-nwse-resize fill-deep-space"
                    onPointerDown={(e) => empezar(e, m, "redimensionar")}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {editando && (
        <div className="rounded-xl border border-frosted bg-white p-4 text-sm shadow-sm">
          {elegido ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{nombreMueble(elegido)}</p>
                <p className="text-xs text-steel">
                  {TIPOS[elegido.tipo]} · {elegido.ancho}×{elegido.alto} celdas
                  · {elegido.repisas.length} repisas
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => rotar(elegido)}
                  disabled={pendiente}
                  className={`${boton} border border-frosted hover:bg-honeydew`}
                >
                  ↻ Rotar
                </button>
                <Link
                  href={`/ubicaciones/${elegido.id}`}
                  className={`${boton} bg-deep-space text-honeydew hover:bg-deep-space/90`}
                >
                  Repisas y datos →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-steel">
              Arrastra un mueble para moverlo, su esquina oscura para cambiar el
              tamaño, o selecciónalo y usa las flechas del teclado. Los cambios
              se guardan solos.
            </p>
          )}
        </div>
      )}

      {q && (
        <div className="rounded-xl border border-frosted bg-white p-4 text-sm shadow-sm">
          {encontrados.length === 0 ? (
            <p className="text-steel">
              Nada coincide con “{busqueda}” en esta zona.
            </p>
          ) : (
            <ul className="grid gap-1.5">
              {encontrados.flatMap((m) => {
                const repisas = m.repisas.filter((r) =>
                  normalizar(r.contenido).includes(q),
                );
                // si coincide el nombre del mueble pero ninguna repisa, se muestra el mueble
                const filas =
                  repisas.length > 0
                    ? repisas.map((r) => ({
                        clave: `r${r.id}`,
                        texto: etiquetaUbicacion(zona.nombre, m, r.numero),
                        contenido: r.contenido,
                      }))
                    : [
                        {
                          clave: `m${m.id}`,
                          texto: etiquetaUbicacion(zona.nombre, m),
                          contenido: "",
                        },
                      ];
                return filas.map((f) => (
                  <li key={f.clave}>
                    <Link
                      href={`/ubicaciones/${m.id}`}
                      className="hover:underline"
                    >
                      <span className="font-medium">{f.texto}</span>
                      {f.contenido && (
                        <span className="text-steel"> → {f.contenido}</span>
                      )}
                    </Link>
                  </li>
                ));
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

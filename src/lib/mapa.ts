// Reglas del mapa de ubicaciones: tamaño de la cuadrícula, choques entre muebles
// y el texto de cada ubicación. Las posiciones y tamaños van en celdas, no en píxeles.

export const COLUMNAS = 30;
export const FILAS = 18;

export const TIPOS = {
  estante: "Estante",
  vitrina: "Vitrina",
  refrigerador: "Refrigerador",
  meson: "Mesón",
} as const;

export type TipoMueble = keyof typeof TIPOS;

// tamaño con que aparece un mueble nuevo
export const TAMANO_INICIAL: Record<
  TipoMueble,
  { ancho: number; alto: number }
> = {
  estante: { ancho: 4, alto: 1 },
  vitrina: { ancho: 3, alto: 1 },
  refrigerador: { ancho: 2, alto: 2 },
  meson: { ancho: 6, alto: 2 },
};

export type Rect = { x: number; y: number; ancho: number; alto: number };

// queda completo dentro de la cuadrícula y mide al menos 1x1
export function dentroDelMapa(r: Rect): boolean {
  return (
    Number.isInteger(r.x) &&
    Number.isInteger(r.y) &&
    Number.isInteger(r.ancho) &&
    Number.isInteger(r.alto) &&
    r.ancho >= 1 &&
    r.alto >= 1 &&
    r.x >= 0 &&
    r.y >= 0 &&
    r.x + r.ancho <= COLUMNAS &&
    r.y + r.alto <= FILAS
  );
}

// se pisan si comparten al menos una celda (tocarse por el borde no cuenta)
export function seSuperponen(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.ancho &&
    b.x < a.x + a.ancho &&
    a.y < b.y + b.alto &&
    b.y < a.y + a.alto
  );
}

// se puede dejar `r` ahí: dentro del mapa y sin pisar a los otros (se ignora el de id `ignorar`, que es el mismo mueble)
export function posicionLibre(
  r: Rect,
  otros: (Rect & { id: number })[],
  ignorar?: number,
): boolean {
  return (
    dentroDelMapa(r) &&
    otros.every((o) => o.id === ignorar || !seSuperponen(r, o))
  );
}

// primer lugar libre recorriendo fila por fila, de izquierda a derecha; null si no cabe
export function buscarHueco(
  ancho: number,
  alto: number,
  otros: (Rect & { id: number })[],
): { x: number; y: number } | null {
  for (let y = 0; y + alto <= FILAS; y++) {
    for (let x = 0; x + ancho <= COLUMNAS; x++) {
      if (posicionLibre({ x, y, ancho, alto }, otros)) return { x, y };
    }
  }
  return null;
}

// mantiene un valor entre min y max
export function limitar(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

// "Estante 1" + "sala" → "Estante 1 (sala)"
export function nombreMueble(m: { nombre: string; detalle: string | null }) {
  return m.detalle ? `${m.nombre} (${m.detalle})` : m.nombre;
}

// "SALA DE VENTAS - Estante 1 (sala), Repisa 2"
export function etiquetaUbicacion(
  zona: string,
  mueble: { nombre: string; detalle: string | null },
  repisa?: number,
): string {
  const base = `${zona.toLocaleUpperCase("es-CL")} - ${nombreMueble(mueble)}`;
  return repisa === undefined ? base : `${base}, Repisa ${repisa}`;
}

// para buscar sin importar tildes ni mayúsculas: "Oftálmicos" → "oftalmicos"
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita las tildes que dejó normalize("NFD")
    .toLowerCase()
    .trim();
}

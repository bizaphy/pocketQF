// Cruce entre fichas (por principio activo) y productos del Excel.
// El POS no separa el principio activo, pero casi siempre viene dentro del nombre:
// "OLMEPRESS OLMESARTAN 20MG 40 COMP" → ficha "Olmesartán".
// Un producto queda asociado a una ficha si su nombre contiene el principio activo o alguno
// de sus términos como palabra completa, o si se asoció a mano.

import { normalizar } from "@/lib/mapa";

export type FichaCruce = {
  id: number;
  principioActivo: string;
  terminos: string | null;
  productoIds: number[]; // asociados a mano
};

export type ProductoCruce = { id: number; nombre: string };

// "Hioscina" + "hiocina, butilbromuro" → ["hioscina", "hiocina", "butilbromuro"]
export function terminosDeFicha(
  ficha: Pick<FichaCruce, "principioActivo" | "terminos">,
): string[] {
  const todos = [ficha.principioActivo, ...(ficha.terminos ?? "").split(",")]
    .map(normalizar)
    .filter((t) => t.length >= 3); // "b6" o "c" coincidirían con demasiados productos
  return [...new Set(todos)];
}

// palabra completa: "sal" no debe coincidir con "salbutamol"
function contienePalabra(texto: string, termino: string): boolean {
  const escapado = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(texto);
}

export function coincideNombre(nombre: string, terminos: string[]): boolean {
  const texto = normalizar(nombre);
  return terminos.some((t) => contienePalabra(texto, t));
}

export function fichasDeProducto<F extends FichaCruce>(
  producto: ProductoCruce,
  fichas: F[],
): F[] {
  return fichas.filter(
    (f) =>
      f.productoIds.includes(producto.id) ||
      coincideNombre(producto.nombre, terminosDeFicha(f)),
  );
}

// productos de una ficha, separando los que coinciden por nombre de los agregados a mano
export function productosDeFicha<P extends ProductoCruce>(
  ficha: FichaCruce,
  productos: P[],
): { porNombre: P[]; aMano: P[] } {
  const terminos = terminosDeFicha(ficha);
  const porNombre: P[] = [];
  const aMano: P[] = [];
  for (const p of productos) {
    if (coincideNombre(p.nombre, terminos)) porNombre.push(p);
    else if (ficha.productoIds.includes(p.id)) aMano.push(p);
  }
  return { porNombre, aMano };
}

// --- búsqueda por uso o efecto (ej: "dejar de fumar" → Anfebutamona) ---

export const CAMPOS_FICHA = {
  indicaciones: "Diagnóstico o uso típico",
  efectosSecundarios: "Efectos secundarios",
  observaciones: "Precauciones y consejos",
} as const;

export type CampoFicha = keyof typeof CAMPOS_FICHA;

type TextosFicha = Record<CampoFicha, string | null>;

// palabras a buscar: sin tildes ni mayúsculas, y sin palabras de relleno ("para", "de"...)
const RELLENO = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "o",
  "a",
  "en",
  "para",
  "por",
  "con",
  "que",
  "un",
  "una",
]);

export function palabrasBusqueda(texto: string): string[] {
  return [
    ...new Set(
      normalizar(texto)
        .split(/[^a-z0-9ñ]+/)
        .filter((p) => p.length >= 2 && !RELLENO.has(p)),
    ),
  ];
}

// una ficha coincide si cada palabra aparece en alguno de sus textos (en cualquier orden);
// devuelve los campos donde aparece al menos una, en el orden de CAMPOS_FICHA
export function buscarEnFichas<F extends TextosFicha>(
  fichas: F[],
  texto: string,
): { ficha: F; campos: CampoFicha[] }[] {
  const palabras = palabrasBusqueda(texto);
  if (palabras.length === 0) return [];
  const campos = Object.keys(CAMPOS_FICHA) as CampoFicha[];

  const resultados: { ficha: F; campos: CampoFicha[] }[] = [];
  for (const ficha of fichas) {
    const textos = campos.map((c) => normalizar(ficha[c] ?? ""));
    const todas = palabras.every((p) => textos.some((t) => t.includes(p)));
    if (!todas) continue;
    resultados.push({
      ficha,
      campos: campos.filter((_, i) =>
        palabras.some((p) => textos[i].includes(p)),
      ),
    });
  }
  return resultados;
}

// parte el texto original en trozos marcando dónde aparecen las palabras (sin importar tildes),
// para resaltarlas sin perder las tildes ni mayúsculas que se escribieron
export function resaltar(
  texto: string,
  palabras: string[],
): { texto: string; marcado: boolean }[] {
  // letra por letra, así cada posición del texto plegado coincide con la del original
  const plegado = [...texto]
    .map(
      (c) =>
        c
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()[0] ?? c,
    )
    .join("");
  const letras = [...texto];
  const marcas = new Array<boolean>(letras.length).fill(false);
  for (const p of palabras) {
    for (let i = plegado.indexOf(p); i !== -1; i = plegado.indexOf(p, i + 1)) {
      marcas.fill(true, i, i + p.length);
    }
  }

  const trozos: { texto: string; marcado: boolean }[] = [];
  letras.forEach((c, i) => {
    const ultimo = trozos.at(-1);
    if (ultimo && ultimo.marcado === marcas[i]) ultimo.texto += c;
    else trozos.push({ texto: c, marcado: marcas[i] });
  });
  return trozos;
}

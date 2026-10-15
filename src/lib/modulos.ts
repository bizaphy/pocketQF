// Datos de cada módulo de la app: lo usan el menú, las tarjetas del inicio y los encabezados.
// imagen: ilustración a color en /public (si no hay, se dibuja el ícono lineal)
// icono: trazo SVG (viewBox 24x24) para el menú y como reemplazo de la imagen
// acento: clases de Tailwind escritas completas (Tailwind no detecta clases armadas con variables)

export type Modulo = {
  href: string;
  nombre: string; // nombre corto para el menú
  titulo: string; // nombre largo para la tarjeta del inicio
  descripcion: string;
  activo: boolean;
  imagen?: string;
  icono: string;
  acento: {
    borde: string; // borde superior de la tarjeta
    fondo: string; // círculo detrás del ícono
    punto: string; // punto junto a "PocketQF" en el encabezado
    texto: string; // color del ícono lineal
    subrayado: string; // subrayado del enlace activo en el menú
  };
};

export const modulos: Modulo[] = [
  {
    href: "/vencimientos",
    nombre: "Vencimientos",
    titulo: "Vencimientos",
    descripcion: "Productos próximos a vencer",
    activo: true,
    imagen: "/calendario_venc.png",
    icono: "M5 6h14v14H5V6Zm0 4h14M9 3v4M15 3v4M12 13v3M12 18.5v.01",
    acento: {
      borde: "border-t-strawberry",
      fondo: "bg-strawberry/12",
      punto: "bg-strawberry",
      texto: "text-strawberry",
      subrayado: "decoration-strawberry",
    },
  },
  {
    href: "/tareas",
    nombre: "Tareas",
    titulo: "Tareas pendientes",
    descripcion: "Pendientes del equipo",
    activo: false,
    icono: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
    acento: {
      borde: "border-t-sage",
      fondo: "bg-sage/12",
      punto: "bg-sage",
      texto: "text-sage",
      subrayado: "decoration-sage",
    },
  },
  {
    href: "/productos",
    nombre: "Productos",
    titulo: "Administrar base de productos",
    descripcion: "Actualizar productos desde el Excel semanal",
    activo: true,
    icono:
      "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M12 18v-6M9 15l3-3 3 3",
    acento: {
      borde: "border-t-steel",
      fondo: "bg-steel/12",
      punto: "bg-steel",
      texto: "text-steel",
      subrayado: "decoration-frosted",
    },
  },
  {
    href: "/inventario",
    nombre: "Inventario",
    titulo: "Inventario del día",
    descripcion: "Conteo de productos al azar o por categoría",
    activo: true,
    icono:
      "M9 4h6v3H9V4Zm-2 1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M9 12l2 2 4-4M9 17h6",
    acento: {
      borde: "border-t-saffron",
      fondo: "bg-saffron/15",
      punto: "bg-saffron",
      texto: "text-saffron",
      subrayado: "decoration-saffron",
    },
  },
  {
    href: "/ubicaciones",
    nombre: "Ubicaciones",
    titulo: "Ubicaciones",
    descripcion: "Mapa de la farmacia con estantes y repisas",
    activo: true,
    icono: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
    acento: {
      borde: "border-t-moss",
      fondo: "bg-moss/12",
      punto: "bg-moss",
      texto: "text-moss",
      subrayado: "decoration-moss",
    },
  },
  {
    href: "/pocket-qf",
    nombre: "Pocket QF",
    titulo: "Pocket QF",
    descripcion: "Fichas de medicamentos",
    activo: false,
    icono: "M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7l-6 6ZM7 10l7 7",
    acento: {
      borde: "border-t-lavender",
      fondo: "bg-lavender/12",
      punto: "bg-lavender",
      texto: "text-lavender",
      subrayado: "decoration-lavender",
    },
  },
];

// busca el módulo por su ruta (ej: "/vencimientos")
export function obtenerModulo(href: string): Modulo {
  const modulo = modulos.find((m) => m.href === href);
  if (!modulo) throw new Error(`No existe el módulo ${href}`);
  return modulo;
}

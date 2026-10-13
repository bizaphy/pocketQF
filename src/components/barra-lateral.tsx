// Enlaces externos de consulta rápida para la farmacia.
// icono: trazo SVG (viewBox 24x24) que se dibuja junto al nombre
const enlaces = [
  {
    href: "https://registrosanitario.ispch.gob.cl/",
    nombre: "Registro ISP",
    descripcion: "Medicamentos registrados",
    icono: "M9 12h6M9 16h6M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  },
  {
    href: "https://www.ispch.gob.cl/noticias-2-0/",
    nombre: "Noticias ISP",
    descripcion: "Alertas y comunicados",
    icono: "M4 5h13v14H6a2 2 0 0 1-2-2V5Zm13 4h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5",
  },
  {
    href: "https://www.feriados.cl/",
    nombre: "Calendario nacional",
    descripcion: "Feriados de Chile",
    icono: "M5 6h14v14H5V6Zm0 4h14M9 3v4M15 3v4",
  },
];

export default function BarraLateral() {
  return (
    <aside className="w-full shrink-0 border-t border-frosted/70 bg-white/60 lg:w-64 lg:border-t-0 lg:border-r">
      {/* sticky: en escritorio la barra queda fija al hacer scroll */}
      <nav className="px-3 py-6 lg:sticky lg:top-0 lg:py-10">
        <h2 className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-steel/80">
          Enlaces útiles
        </h2>
        <ul className="mt-4 flex flex-col gap-1">
          {enlaces.map((e) => (
            <li key={e.href}>
              {/* target="_blank": abre en otra pestaña; rel evita que la página externa acceda a la nuestra */}
              <a
                href={e.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-honeydew"
              >
                {/* franja de acento que aparece a la izquierda al pasar el mouse */}
                <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-steel opacity-0 transition-opacity group-hover:opacity-100" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 shrink-0 text-steel transition-colors group-hover:text-deep-space"
                  aria-hidden
                >
                  <path d={e.icono} />
                </svg>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-tight">
                    {e.nombre}
                  </span>
                  <span className="block text-xs text-steel">
                    {e.descripcion}
                  </span>
                </span>
                <span
                  className="text-xs text-steel opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// Interruptor (switch) que funciona con la URL: es un enlace que activa o quita un parámetro (?x=1).
// La página lee ese parámetro en searchParams y se vuelve a dibujar. No necesita JavaScript del cliente.

import Link from "next/link";

export default function Interruptor({
  activo,
  href, // a dónde lleva al hacer clic (la URL con el estado contrario)
  children,
}: {
  activo: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false} // al cambiar, la página no salta arriba
      replace // no llena el historial del navegador con cada cambio
      role="switch"
      aria-checked={activo}
      className="flex items-center gap-2 text-sm text-steel hover:text-deep-space"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${activo ? "bg-steel" : "bg-frosted"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${activo ? "left-[1.125rem]" : "left-0.5"}`}
        />
      </span>
      {children}
    </Link>
  );
}

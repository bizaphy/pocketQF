"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modulos } from "@/lib/modulos";

// solo los módulos que ya existen aparecen en el menú
const links = modulos.filter((m) => m.activo);

export default function Navbar() {
  const pathname = usePathname(); // ej: "/vencimientos"

  return (
    <nav className="bg-deep-space text-honeydew">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-bold">
          PocketQF
        </Link>
        {links.map((l) => {
          // startsWith: "/inventario/3" también marca "Inventario" como activo
          const activo = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 ${
                activo
                  ? `font-semibold underline decoration-2 underline-offset-8 ${l.acento.subrayado}`
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0"
                aria-hidden
              >
                <path d={l.icono} />
              </svg>
              {l.nombre}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

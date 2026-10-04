"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", nombre: "Inicio" },
  { href: "/vencimientos", nombre: "Vencimientos" },
];

export default function Navbar() {
  const pathname = usePathname(); // ej: "/vencimientos"

  return (
    <nav className="bg-deep-space text-honeydew">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 py-3">
        <span className="font-bold">PocketQF</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              pathname === l.href
                ? "font-semibold underline underline-offset-4"
                : "opacity-80 hover:opacity-100"
            }
          >
            {l.nombre}
          </Link>
        ))}
      </div>
    </nav>
  );
}

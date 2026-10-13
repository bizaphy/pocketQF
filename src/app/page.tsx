import Link from "next/link";
import PostIt from "@/components/post-it";

const modulos = [
  {
    href: "/vencimientos",
    nombre: "Vencimientos",
    descripcion: "Productos próximos a vencer",
    activo: true,
  },
  {
    href: "/tareas",
    nombre: "Tareas pendientes",
    descripcion: "Pendientes del equipo",
    activo: false,
  },
  {
    href: "/productos",
    nombre: "Administrar base de productos",
    descripcion: "Actualizar productos desde el Excel semanal",
    activo: true,
  },
  {
    href: "/inventario",
    nombre: "Inventario del día",
    descripcion: "Conteo de productos al azar o por categoría",
    activo: true,
  },
  {
    href: "/pocket-qf",
    nombre: "Pocket QF",
    descripcion: "Fichas de medicamentos",
    activo: false,
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">PocketQF</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {modulos.map((m) =>
          m.activo ? (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-xl border border-frosted bg-white p-5 text-center hover:border-steel"
            >
              <h2 className="font-semibold">{m.nombre}</h2>
              <p className="text-sm text-steel">{m.descripcion}</p>
            </Link>
          ) : (
            <div
              key={m.href}
              className="rounded-xl border border-dashed border-frosted p-5 text-center opacity-60"
            >
              <h2 className="font-semibold">{m.nombre}</h2>
              <p className="text-sm text-steel">Próximamente</p>
            </div>
          ),
        )}
      </div>
      <PostIt />
    </main>
  );
}

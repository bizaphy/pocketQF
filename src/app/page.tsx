import Link from "next/link";
import PostIt from "@/components/post-it";
import IconoModulo from "@/components/icono-modulo";
import { modulos } from "@/lib/modulos";

export default function Home() {
  return (
    // fondo propio del inicio, de alto completo: sage al 25% sobre el honeydew de la página,
    // el mismo tono verdoso de las demás páginas pero un poco más oscuro
    <div className="flex-1 bg-sage/25">
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">PocketQF</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {modulos.map((m) =>
            m.activo && m.destacado ? (
              // tarjeta destacada: todo el ancho, fondo verde oscuro (el tono del fondo del inicio) y texto blanco
              <Link
                key={m.href}
                href={m.href}
                className="group relative flex items-center gap-5 overflow-hidden rounded-xl bg-sage-oscuro p-6 text-white shadow-md transition-[box-shadow,filter] hover:shadow-xl hover:brightness-110 sm:col-span-2"
              >
                <IconoModulo modulo={m} tamano={72} claro />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Consulta rápida
                  </span>
                  <h2 className="mt-1.5 text-xl font-bold">{m.titulo}</h2>
                  <p className="text-sm text-white/85">{m.descripcion}</p>
                </div>
                <span
                  className="hidden text-2xl text-white transition-transform group-hover:translate-x-1 sm:block"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ) : m.activo ? (
              <Link
                key={m.href}
                href={m.href}
                // border-t-4: franja superior con el color del módulo
                className={`flex items-center gap-4 rounded-xl border border-t-4 border-frosted bg-white p-5 text-deep-space transition-shadow hover:shadow-md ${m.acento.borde}`}
              >
                <IconoModulo modulo={m} />
                <div>
                  <h2 className="font-semibold">{m.titulo}</h2>
                  <p className="text-sm text-steel">{m.descripcion}</p>
                </div>
              </Link>
            ) : (
              <div
                key={m.href}
                className="flex items-center gap-4 rounded-xl border border-dashed border-frosted bg-honeydew/60 p-5 opacity-70 grayscale"
              >
                <IconoModulo modulo={m} />
                <div>
                  <h2 className="font-semibold">{m.titulo}</h2>
                  <p className="text-sm text-steel">Próximamente</p>
                </div>
              </div>
            ),
          )}
        </div>
        <PostIt />
      </main>
    </div>
  );
}

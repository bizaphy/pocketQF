import IconoModulo from "@/components/icono-modulo";
import type { Modulo } from "@/lib/modulos";

// Encabezado común de las páginas de cada módulo: ícono, título y descripción.
// children: acciones a la derecha (ej: botón "Agregar")
export default function EncabezadoModulo({
  modulo,
  titulo,
  descripcion,
  children,
}: {
  modulo: Modulo;
  titulo: string;
  descripcion: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        <IconoModulo modulo={modulo} tamano={64} />
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-steel">
            <span className={`size-2 rounded-full ${modulo.acento.punto}`} />
            PocketQF
          </p>
          <h1 className="mt-1 text-3xl font-bold text-deep-space">{titulo}</h1>
          <p className="mt-1 text-steel">{descripcion}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

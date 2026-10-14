import Image from "next/image";
import type { Modulo } from "@/lib/modulos";

// Ícono de un módulo dentro de un círculo con su color de acento.
// Si el módulo tiene ilustración en /public se muestra esa; si no, el ícono lineal.
export default function IconoModulo({
  modulo,
  tamano = 56, // diámetro del círculo en px
}: {
  modulo: Modulo;
  tamano?: number;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${modulo.acento.fondo}`}
      style={{ width: tamano, height: tamano }}
      aria-hidden
    >
      {modulo.imagen ? (
        <Image
          src={modulo.imagen}
          alt=""
          width={Math.round(tamano * 0.68)}
          height={Math.round(tamano * 0.68)}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={modulo.acento.texto}
          style={{ width: tamano * 0.5, height: tamano * 0.5 }}
        >
          <path d={modulo.icono} />
        </svg>
      )}
    </span>
  );
}

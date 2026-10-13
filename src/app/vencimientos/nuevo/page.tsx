import type { Metadata } from "next";
import Link from "next/link";
import FormularioVencimiento from "@/components/formulario-vencimiento";
import { obtenerProductosActivos } from "@/lib/consultas";

export const metadata: Metadata = { title: "Nuevo vencimiento" };

export default async function NuevoVencimientoPage() {
  const productos = await obtenerProductosActivos();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link href="/vencimientos" className="text-sm text-steel hover:underline">
        ← Volver a vencimientos
      </Link>
      <h1 className="mb-6 mt-2 text-3xl font-bold text-deep-space">
        Nuevo vencimiento
      </h1>
      {productos.length === 0 ? (
        <p className="text-steel">
          No hay productos cargados.{" "}
          <Link href="/productos" className="underline">
            Sube el Excel de productos
          </Link>{" "}
          para poder registrar vencimientos.
        </p>
      ) : (
        <FormularioVencimiento productos={productos} />
      )}
    </main>
  );
}

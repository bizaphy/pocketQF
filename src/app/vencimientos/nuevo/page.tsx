import type { Metadata } from "next";
import FormularioVencimiento from "@/components/formulario-vencimiento";
import { obtenerProductosActivos } from "@/lib/consultas";

export const metadata: Metadata = { title: "Nuevo vencimiento" };

export default async function NuevoVencimientoPage() {
  const productos = await obtenerProductosActivos();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-deep-space">
        Nuevo vencimiento
      </h1>
      <FormularioVencimiento productos={productos} />
    </main>
  );
}

// Pie de página. Queda pegado abajo aunque la página tenga poco contenido:
// el layout es una columna de alto completo y el contenido de en medio crece (flex-1).
// Sin margen arriba para que los fondos lleguen hasta el pie; el espacio lo da cada página.
export default function Footer() {
  return (
    <footer className="bg-deep-space text-honeydew print:hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 text-sm">
        <p className="font-bold">PocketQF</p>
        <p className="opacity-80">
          Herramientas para la farmacia: vencimientos, tareas y consulta rápida
        </p>
      </div>
    </footer>
  );
}

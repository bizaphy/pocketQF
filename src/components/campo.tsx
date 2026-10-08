// Campo de formulario: muestra el label, el input que recibe y el mensaje de error

export default function Campo({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
      {error && <span className="text-xs text-strawberry">{error}</span>}
    </label>
  );
}

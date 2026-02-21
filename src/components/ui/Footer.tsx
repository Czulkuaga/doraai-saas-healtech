export function Footer({ clinicName }: { clinicName?: string }) {
  return (
    <footer className="mt-auto p-8 text-center">
      <p className="text-xs text-slate-400">
        © 2026 {clinicName ?? "Clínica"}. Gestión Médica Avanzada. Todos los derechos reservados.
      </p>
    </footer>
  );
}
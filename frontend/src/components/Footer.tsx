export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="flex h-14 w-full px-3 sm:px-6 items-center justify-between text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-foreground">RappiGas Perú</span>. Todos los derechos reservados.
        </span>
        <span className="text-xs">
          Plataforma de Distribución de Gas GLP
        </span>
      </div>
    </footer>
  )
}

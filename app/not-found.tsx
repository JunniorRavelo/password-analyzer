import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Página no encontrada
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          La ruta no existe o fue movida. Vuelve al inicio para usar PassGuard.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Ir al inicio
      </Link>
    </div>
  )
}

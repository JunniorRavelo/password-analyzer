'use client'

import React, { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Shield,
  BookOpen,
  ListChecks,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { PasswordGeneratorPanel } from '@/components/password-generator-panel'
import {
  ATTEMPTS_PER_SECOND,
  STRENGTH_LEVELS,
  calculatePasswordStrength,
  formatCrackTime,
  suggestionText,
  validatePassword,
} from '@/lib/password-utils'
import { cn } from '@/lib/utils'

export default function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldCopied, setFieldCopied] = useState(false)

  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  )
  const errors = useMemo(() => validatePassword(password), [password])
  const suggestion = useMemo(
    () => suggestionText(password),
    [password]
  )

  const copyField = useCallback(async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setFieldCopied(true)
      window.setTimeout(() => setFieldCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [password])

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 app-backdrop"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.45]"
        aria-hidden
      />

      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
      >
        Ir al contenido principal
      </a>

      <header className="relative z-10 border-b border-border/60 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Shield className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Herramienta de seguridad
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                PassGuard
              </h1>
            </div>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-right">
            Genera contraseñas aleatorias en el navegador y, a continuación,
            evalúa su fortaleza y el tiempo de búsqueda estimado.
          </p>
        </div>
      </header>

      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
      >
        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <PasswordGeneratorPanel
              onApplyPassword={(value) => {
                setPassword(value)
                setShowPassword(true)
              }}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-8">
            <section
              className="rounded-2xl border border-border/60 bg-card/35 p-6 shadow-lg shadow-black/15 backdrop-blur-sm sm:p-8"
              aria-labelledby="analyzer-heading"
            >
              <div className="mb-6 flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h2
                    id="analyzer-heading"
                    className="text-lg font-semibold tracking-tight"
                  >
                    Analizar contraseña
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    La estimación es orientativa y asume un ataque de fuerza
                    bruta genérico.
                  </p>
                </div>
              </div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Escribe o pega aquí…"
                  className="w-full rounded-xl border border-input bg-background/80 py-3 pr-28 pl-4 font-mono text-base text-foreground shadow-inner outline-none ring-offset-background transition-shadow placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <div className="absolute inset-y-1 right-1 flex items-center gap-0.5 rounded-r-lg bg-background/90 p-0.5">
                  <button
                    type="button"
                    onClick={copyField}
                    disabled={!password}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Copiar contraseña del campo"
                  >
                    {fieldCopied ? (
                      <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassword('')}
                    disabled={!password}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Limpiar campo"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              {errors.length > 0 && (
                <ul
                  className="mt-4 list-inside list-disc space-y-1 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              <div className="mt-8 space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Puntuación
                    </p>
                    <p className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tabular-nums">
                        {password.length === 0 ? '—' : Math.round(strength.score)}
                      </span>
                      <span className="text-muted-foreground">/ 100</span>
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      password.length === 0
                        ? 'text-muted-foreground'
                        : strength.strengthLevel.colorClass
                    )}
                  >
                    {password.length === 0
                      ? 'Sin datos'
                      : strength.strengthLevel.name}
                  </p>
                </div>
                <Progress
                  value={password.length === 0 ? 0 : strength.score}
                  indicatorClassName={
                    password.length === 0
                      ? undefined
                      : 'shadow-[0_0_12px_-2px_var(--tw-shadow-color)] shadow-current'
                  }
                  indicatorStyle={{
                    backgroundColor:
                      password.length === 0
                        ? '#52525b'
                        : strength.strengthLevel.barColor,
                  }}
                />
              </div>

              <div className="mt-8 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  label="Longitud"
                  value={
                    password.length === 0
                      ? '—'
                      : String(strength.length)
                  }
                />
                <StatCard
                  label="Tipos de carácter"
                  value={
                    password.length === 0
                      ? '—'
                      : `${strength.categories} / 4`
                  }
                />
                <StatCard
                  label="Tiempo estimado"
                  value={
                    password.length === 0
                      ? '—'
                      : formatCrackTime(strength.secondsToCrack)
                  }
                  small
                />
              </div>

              <p className="mt-6 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                {suggestion}
              </p>
            </section>

            <section
              className="rounded-2xl border border-border/60 bg-card/35 p-6 shadow-lg shadow-black/15 backdrop-blur-sm sm:p-8"
              aria-labelledby="levels-heading"
            >
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" aria-hidden />
                <h2 id="levels-heading" className="text-lg font-semibold">
                  Escala de niveles
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-border/80">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/50">
                      <th scope="col" className="px-4 py-3 font-medium">
                        Nivel
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Rango de puntaje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {STRENGTH_LEVELS.map((level, index) => (
                      <tr
                        key={level.name}
                        className={cn(
                          'border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30',
                          password.length > 0 &&
                            strength.strengthLevel.name === level.name &&
                            'bg-primary/10'
                        )}
                      >
                        <td
                          className={cn(
                            'px-4 py-3 font-medium',
                            level.colorClass
                          )}
                        >
                          {level.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {index === 0
                            ? `≤ ${level.maxScore}`
                            : `>${STRENGTH_LEVELS[index - 1]!.maxScore} – ${level.maxScore}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <details className="group rounded-2xl border border-border/60 bg-card/35 shadow-lg shadow-black/15 backdrop-blur-sm">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-6 py-5 font-semibold [&::-webkit-details-marker]:hidden">
                <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                Cómo se calcula la estimación
                <span className="ml-auto text-sm font-normal text-muted-foreground group-open:hidden">
                  Abrir
                </span>
                <span className="ml-auto hidden text-sm font-normal text-muted-foreground group-open:inline">
                  Cerrar
                </span>
              </summary>
              <div className="border-t border-border/60 px-6 pb-6 pt-2 text-sm leading-relaxed text-muted-foreground">
                <p className="mb-4 text-foreground/90">
                  Se aproxima el espacio de búsqueda como{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    |alfabeto|
                    <sup>longitud</sup>
                  </code>{' '}
                  y se divide por una tasa de intentos por segundo fija (
                  {ATTEMPTS_PER_SECOND.toLocaleString('es')}) solo a modo
                  ilustrativo.
                </p>
                <ul className="mb-4 list-inside list-disc space-y-2">
                  <li>
                    Tamaño del alfabeto actual:{' '}
                    <strong className="text-foreground">
                      {password.length === 0 ? '—' : strength.charSetSize}
                    </strong>
                  </li>
                  <li>
                    Combinaciones (orden de magnitud):{' '}
                    <strong className="text-foreground">
                      {password.length === 0 || strength.charSetSize === 0
                        ? '—'
                        : strength.possibleCombinations.toExponential(2)}
                    </strong>
                  </li>
                  <li>
                    Si hay menos de tres tipos de caracteres, se aplica una
                    penalización al tiempo y al puntaje.
                  </li>
                </ul>
                <p>
                  Las contraseñas reales pueden ser mucho más débiles si aparecen
                  en filtraciones o son frases de diccionario. Esta herramienta no
                  sustituye a un gestor de contraseñas ni a la MFA.
                </p>
              </div>
            </details>

            <section
              className="rounded-2xl border border-border/60 bg-card/35 p-6 shadow-lg shadow-black/15 backdrop-blur-sm sm:p-8"
              aria-labelledby="rules-heading"
            >
              <h2 id="rules-heading" className="mb-4 text-lg font-semibold">
                Criterios recomendados
              </h2>
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>Mínimo 8 caracteres; idealmente 12 o más para cuentas críticas.</li>
                <li>Combina mayúsculas, minúsculas, números y símbolos.</li>
                <li>Evita patrones obvios y repeticiones del mismo carácter.</li>
                <li>Usa el generador con exclusiones ambiguas si copias contraseñas a mano.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto border-t border-border/60 bg-background/70 py-10 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="space-y-5 text-sm">
              <p className="font-medium text-foreground">Autores</p>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <span className="text-foreground">J. Santiago Ravelo</span>{' '}
                  ·{' '}
                  <Link
                    href="https://github.com/JunniorRavelo"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    GitHub
                  </Link>{' '}
                  ·{' '}
                  <Link
                    href="https://www.linkedin.com/in/jsravelo/"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    LinkedIn
                  </Link>
                </p>
                <p>
                  <span className="text-foreground">Omar Castro</span> ·{' '}
                  <Link
                    href="https://github.com/omarcastro2002"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    GitHub
                  </Link>{' '}
                  ·{' '}
                  <Link
                    href="https://www.linkedin.com/in/omar-castro-6b4ba8207/"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    LinkedIn
                  </Link>
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground md:text-right">
              <p className="font-medium text-foreground">Ingeniería de Sistemas</p>
              <p className="mt-2">Universidad de Pamplona, Colombia</p>
            </div>
          </div>
          <p
            className="mt-10 text-center text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} PassGuard · Proyecto académico de
            análisis de fortaleza de contraseñas.
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string
  value: string
  small?: boolean
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border/60 bg-background/50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 max-w-full font-medium text-foreground',
          small
            ? 'text-sm leading-snug break-words [overflow-wrap:anywhere]'
            : 'text-lg tabular-nums'
        )}
      >
        {value}
      </p>
    </div>
  )
}

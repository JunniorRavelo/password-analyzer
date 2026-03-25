'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  generateSecurePassword,
  type GeneratorOptions,
} from '@/lib/password-utils'
import { cn } from '@/lib/utils'
import {
  Copy,
  Check,
  RefreshCw,
  ArrowDownToLine,
  KeyRound,
  SlidersHorizontal,
} from 'lucide-react'

type Props = {
  onApplyPassword: (value: string) => void
  className?: string
}

const DEFAULT_OPTS: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
}

/** Casilla personalizada: recuadro con icono de verificación cuando está seleccionada. */
function OptionCheckboxRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  disabled,
  disabledReason,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  disabledReason?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/40 px-4 py-3.5 transition-colors',
        !disabled && 'hover:bg-card/55'
      )}
    >
      <label
        htmlFor={id}
        title={disabled ? disabledReason : undefined}
        className={cn(
          'flex cursor-pointer items-center gap-3 sm:gap-4',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">
            {label}
          </p>
          {hint ? (
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <span className="relative inline-flex shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="peer sr-only"
            aria-checked={checked}
            aria-disabled={disabled}
          />
          <span
            aria-hidden
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              checked
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-muted-foreground/45 bg-background/90 text-primary-foreground',
              disabled && 'opacity-50'
            )}
          >
            {checked ? (
              <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden />
            ) : null}
          </span>
        </span>
      </label>
    </div>
  )
}

export function PasswordGeneratorPanel({ onApplyPassword, className }: Props) {
  const [opts, setOpts] = useState<GeneratorOptions>(DEFAULT_OPTS)
  const [generated, setGenerated] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeCharsetCount = useMemo(
    () =>
      [opts.lowercase, opts.uppercase, opts.numbers, opts.symbols].filter(
        Boolean
      ).length,
    [opts.lowercase, opts.uppercase, opts.numbers, opts.symbols]
  )

  const runGenerate = useCallback(() => {
    setError(null)
    setCopied(false)
    try {
      const pwd = generateSecurePassword(opts)
      setGenerated(pwd)
    } catch (e) {
      setGenerated('')
      setError(e instanceof Error ? e.message : 'No se pudo generar.')
    }
  }, [opts])

  const copy = useCallback(async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar al portapapeles.')
    }
  }, [generated])

  const lastCharsetHint =
    'Tiene que haber al menos un tipo de carácter marcado para poder generar.'

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card/40 shadow-xl shadow-black/25 backdrop-blur-md',
        className
      )}
      aria-labelledby="generator-heading"
    >
      <div className="border-b border-border/50 bg-muted/20 px-5 py-5 sm:px-6">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2
              id="generator-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Generador de contraseñas
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Marca o desmarca cada casilla. La aleatoriedad usa{' '}
              <code className="rounded-md bg-muted px-1.5 py-px font-mono text-xs">
                crypto.getRandomValues
              </code>
              ; nada sale de tu navegador.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6 sm:px-6 sm:py-7">
        <fieldset className="space-y-3 border-0 p-0">
          <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
            Longitud
          </legend>
          <div className="rounded-xl border border-border/60 bg-card/30 p-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Número de caracteres
              </span>
              <span className="rounded-lg bg-primary/15 px-3 py-1 font-mono text-lg font-semibold tabular-nums text-primary">
                {opts.length}
              </span>
            </div>
            <input
              id="pwd-length"
              type="range"
              min={4}
              max={64}
              value={opts.length}
              onChange={(e) =>
                setOpts((o) => ({ ...o, length: Number(e.target.value) }))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              aria-valuemin={4}
              aria-valuemax={64}
              aria-valuenow={opts.length}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Entre 4 y 64. Valores altos suelen ser más seguros si el sitio lo
              admite.
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-3 border-0 p-0">
          <legend className="mb-1 text-sm font-semibold text-foreground">
            Tipos de carácter
          </legend>
          <p className="text-xs text-muted-foreground">
            Casilla <strong className="text-foreground/90">con ✓</strong>: se
            incluye ese tipo en la contraseña. Vacía: no se usa.
          </p>
          <div className="flex flex-col gap-2.5">
            <OptionCheckboxRow
              id="g-lowercase"
              label="Letras minúsculas"
              hint="a–z"
              checked={opts.lowercase}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, lowercase: v }))}
              disabled={opts.lowercase && activeCharsetCount <= 1}
              disabledReason={lastCharsetHint}
            />
            <OptionCheckboxRow
              id="g-uppercase"
              label="Letras mayúsculas"
              hint="A–Z"
              checked={opts.uppercase}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, uppercase: v }))}
              disabled={opts.uppercase && activeCharsetCount <= 1}
              disabledReason={lastCharsetHint}
            />
            <OptionCheckboxRow
              id="g-numbers"
              label="Números"
              hint="Dígitos (el subconjunto depende de «ambiguos»)"
              checked={opts.numbers}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, numbers: v }))}
              disabled={opts.numbers && activeCharsetCount <= 1}
              disabledReason={lastCharsetHint}
            />
            <OptionCheckboxRow
              id="g-symbols"
              label="Símbolos"
              hint="Signos seguros para contraseñas"
              checked={opts.symbols}
              onCheckedChange={(v) => setOpts((o) => ({ ...o, symbols: v }))}
              disabled={opts.symbols && activeCharsetCount <= 1}
              disabledReason={lastCharsetHint}
            />
          </div>
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Legibilidad</p>
          <OptionCheckboxRow
            id="g-ambiguous"
            label="Excluir caracteres ambiguos"
            hint="Evita 0/O, 1/l, I, etc., útil si copias la contraseña a mano."
            checked={opts.excludeAmbiguous}
            onCheckedChange={(v) =>
              setOpts((o) => ({ ...o, excludeAmbiguous: v }))
            }
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={runGenerate}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-[opacity,box-shadow] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Generar contraseña
          </button>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={copy}
              disabled={!generated}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/60 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? 'Copiada' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={() => generated && onApplyPassword(generated)}
              disabled={!generated}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/60 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden />
              Enviar al analizador
            </button>
          </div>
        </div>

        {error ? (
          <p
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {generated ? (
          <div className="rounded-xl border border-primary/25 bg-muted/25 p-4 ring-1 ring-primary/10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contraseña generada
            </p>
            <p
              className="break-all font-mono text-sm leading-relaxed tracking-wide text-foreground select-all"
              data-testid="generated-password"
            >
              {generated}
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
            Pulsa «Generar contraseña» para obtener un resultado con la
            configuración actual.
          </p>
        )}
      </div>
    </section>
  )
}

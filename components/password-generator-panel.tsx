'use client'

import { useCallback, useState } from 'react'
import {
  generateSecurePassword,
  type GeneratorOptions,
} from '@/lib/password-utils'
import { cn } from '@/lib/utils'
import { Copy, Check, RefreshCw, ArrowDownToLine } from 'lucide-react'

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

function Toggle({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/80 bg-card/40 px-3 py-2.5 text-sm transition-colors hover:bg-card/70',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <span className="text-foreground/90">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          aria-checked={checked}
        />
        <span
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full bg-muted transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:bg-primary'
          )}
        />
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5'
          )}
        />
      </span>
    </label>
  )
}

export function PasswordGeneratorPanel({ onApplyPassword, className }: Props) {
  const [opts, setOpts] = useState<GeneratorOptions>(DEFAULT_OPTS)
  const [generated, setGenerated] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card/30 p-6 shadow-lg shadow-black/20 backdrop-blur-sm',
        className
      )}
      aria-labelledby="generator-heading"
    >
      <div className="mb-6 flex flex-col gap-1">
        <h2 id="generator-heading" className="text-lg font-semibold tracking-tight">
          Generador seguro
        </h2>
        <p className="text-sm text-muted-foreground">
          Aleatorio criptográfico en tu navegador ({' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">crypto.getRandomValues</code>
          ). Nada se envía al servidor.
        </p>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <label htmlFor="pwd-length">Longitud: {opts.length}</label>
          <span className="text-muted-foreground">4–64</span>
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
        />
      </div>

      <div className="mb-6 grid gap-2">
        <Toggle
          id="g-lower"
          label="Minúsculas"
          checked={opts.lowercase}
          onChange={(v) => setOpts((o) => ({ ...o, lowercase: v }))}
        />
        <Toggle
          id="g-upper"
          label="Mayúsculas"
          checked={opts.uppercase}
          onChange={(v) => setOpts((o) => ({ ...o, uppercase: v }))}
        />
        <Toggle
          id="g-num"
          label="Números"
          checked={opts.numbers}
          onChange={(v) => setOpts((o) => ({ ...o, numbers: v }))}
        />
        <Toggle
          id="g-sym"
          label="Símbolos"
          checked={opts.symbols}
          onChange={(v) => setOpts((o) => ({ ...o, symbols: v }))}
        />
        <Toggle
          id="g-ambig"
          label="Excluir ambiguos (0, O, 1, l…)"
          checked={opts.excludeAmbiguous}
          onChange={(v) => setOpts((o) => ({ ...o, excludeAmbiguous: v }))}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Generar
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!generated}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <button
          type="button"
          onClick={() => generated && onApplyPassword(generated)}
          disabled={!generated}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowDownToLine className="h-4 w-4" aria-hidden />
          Usar en analizador
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {generated && (
        <div className="mt-5 rounded-xl border border-border/80 bg-muted/40 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resultado
          </p>
          <p
            className="break-all font-mono text-sm leading-relaxed text-foreground select-all"
            data-testid="generated-password"
          >
            {generated}
          </p>
        </div>
      )}
    </section>
  )
}

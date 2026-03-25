/**
 * Utilidades para análisis y generación de contraseñas (sin dependencias de React).
 */

export const CHAR_SETS = {
  lowercase: 26,
  uppercase: 26,
  numbers: 10,
  symbols: 33,
} as const

/** Capacidad de prueba usada solo como referencia pedagógica (no es una predicción real). */
export const ATTEMPTS_PER_SECOND = 1_000_000_000

export interface StrengthLevel {
  name: string
  /** Clases Tailwind para el texto del nivel */
  colorClass: string
  /** Color hex para la barra de progreso */
  barColor: string
  maxScore: number
}

export const STRENGTH_LEVELS: StrengthLevel[] = [
  { name: 'Muy débil', colorClass: 'text-red-400', barColor: '#f87171', maxScore: 20 },
  { name: 'Débil', colorClass: 'text-orange-400', barColor: '#fb923c', maxScore: 40 },
  { name: 'Aceptable', colorClass: 'text-amber-400', barColor: '#fbbf24', maxScore: 60 },
  { name: 'Fuerte', colorClass: 'text-emerald-400', barColor: '#34d399', maxScore: 80 },
  { name: 'Muy fuerte', colorClass: 'text-teal-300', barColor: '#5eead4', maxScore: 100 },
]

export interface PasswordStrengthResult {
  secondsToCrack: number
  strengthLevel: StrengthLevel
  score: number
  possibleCombinations: number
  charSetSize: number
  length: number
  categories: number
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const length = password.length
  const uniqueChars = new Set(password).size

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  const categories = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length

  let categoryPenalty = 0
  if (categories < 3) {
    categoryPenalty = (3 - categories) * 10
  }

  let charSetSize = 0
  if (hasLowercase) charSetSize += CHAR_SETS.lowercase
  if (hasUppercase) charSetSize += CHAR_SETS.uppercase
  if (hasNumbers) charSetSize += CHAR_SETS.numbers
  if (hasSymbols) charSetSize += CHAR_SETS.symbols

  const possibleCombinations =
    length === 0 || charSetSize === 0 ? 0 : Math.pow(charSetSize, length)

  let secondsToCrack = possibleCombinations / ATTEMPTS_PER_SECOND

  if (categories < 3 && length > 0) {
    secondsToCrack = secondsToCrack / Math.pow(10, 6)
  }

  let score = Math.min(100, length * 5 + categories * 10 + uniqueChars)
  score = score - categoryPenalty
  score = Math.max(0, score)

  const strengthLevel =
    STRENGTH_LEVELS.find((level) => score <= level.maxScore) ??
    STRENGTH_LEVELS[STRENGTH_LEVELS.length - 1]

  return {
    secondsToCrack,
    strengthLevel,
    score,
    possibleCombinations,
    charSetSize,
    length,
    categories,
  }
}

export function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'menos de 1 segundo'
  const units = [
    { label: 'años', seconds: 31_536_000 },
    { label: 'días', seconds: 86_400 },
    { label: 'horas', seconds: 3_600 },
    { label: 'minutos', seconds: 60 },
    { label: 'segundos', seconds: 1 },
  ]

  for (const unit of units) {
    if (seconds >= unit.seconds) {
      const value = Math.floor(seconds / unit.seconds)
      return `${value.toLocaleString('es')} ${unit.label}`
    }
  }
  return 'menos de 1 segundo'
}

export function validatePassword(password: string): string[] {
  const errors: string[] = []
  if (password.length > 0 && password.length < 8) {
    errors.push('Usa al menos 8 caracteres.')
  }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  const categories = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length

  if (password.length > 0 && categories < 3) {
    errors.push(
      'Incluye al menos tres tipos: mayúsculas, minúsculas, números y símbolos.'
    )
  }

  if (password.length > 0 && /^(.)\1+$/.test(password)) {
    errors.push('Evita contraseñas con un solo carácter repetido.')
  }

  return errors
}

export interface GeneratorOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const NUM = '23456789'
const SYM = '!@#$%&*-_=+?'

/** Caracteres excluidos cuando "excludeAmbiguous" está activo (0, O, 1, l, I, etc.). */
const LOWER_FULL = 'abcdefghijklmnopqrstuvwxyz'
const UPPER_FULL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUM_FULL = '0123456789'
const SYM_FULL = '!@#$%^&*()-_=+[]{};:,.?/\\|~'

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error('maxExclusive debe ser positivo')
  const maxValid = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0]! >= maxValid)
  return buf[0]! % maxExclusive
}

function pickChar(pool: string): string {
  return pool[secureRandomInt(pool.length)]!
}

function shuffleString(str: string): string {
  const arr = [...str]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

function charsetForFlag(
  kind: 'lower' | 'upper' | 'num' | 'sym',
  excludeAmbiguous: boolean
): string {
  if (excludeAmbiguous) {
    switch (kind) {
      case 'lower':
        return LOWER
      case 'upper':
        return UPPER
      case 'num':
        return NUM
      case 'sym':
        return SYM
    }
  }
  switch (kind) {
    case 'lower':
      return LOWER_FULL
    case 'upper':
      return UPPER_FULL
    case 'num':
      return NUM_FULL
    case 'sym':
      return SYM_FULL
  }
}

/**
 * Genera una contraseña aleatoria usando crypto del navegador.
 * Garantiza al menos un carácter de cada tipo seleccionado cuando la longitud lo permite.
 */
export function generateSecurePassword(options: GeneratorOptions): string {
  const {
    length,
    uppercase,
    lowercase,
    numbers,
    symbols,
    excludeAmbiguous,
  } = options

  if (length < 4 || length > 64) {
    throw new Error('La longitud debe estar entre 4 y 64.')
  }

  const pools: { flag: boolean; kind: 'lower' | 'upper' | 'num' | 'sym' }[] = [
    { flag: lowercase, kind: 'lower' },
    { flag: uppercase, kind: 'upper' },
    { flag: numbers, kind: 'num' },
    { flag: symbols, kind: 'sym' },
  ]

  const active = pools.filter((p) => p.flag)
  if (active.length === 0) {
    throw new Error('Selecciona al menos un tipo de carácter.')
  }

  if (length < active.length) {
    throw new Error('Aumenta la longitud o reduce los tipos seleccionados.')
  }

  let fullPool = ''
  const guaranteed: string[] = []
  for (const { flag, kind } of active) {
    if (!flag) continue
    const set = charsetForFlag(kind, excludeAmbiguous)
    if (set.length === 0) continue
    fullPool += set
    guaranteed.push(pickChar(set))
  }

  const remaining = length - guaranteed.length
  let out = guaranteed.join('')
  for (let i = 0; i < remaining; i++) {
    out += pickChar(fullPool)
  }
  return shuffleString(out)
}

export function suggestionText(password: string): string {
  if (password.length === 0) {
    return 'Escribe una contraseña o usa el generador para probar una segura.'
  }
  if (password.length < 8) return 'Usa al menos 8 caracteres.'
  const suggestions: string[] = []
  if (!/[A-Z]/.test(password)) suggestions.push('Añade mayúsculas.')
  if (!/[a-z]/.test(password)) suggestions.push('Añade minúsculas.')
  if (!/[0-9]/.test(password)) suggestions.push('Añade números.')
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Añade símbolos.')
  if (suggestions.length > 0) return suggestions.join(' ')
  return 'Buen equilibrio de longitud y diversidad. Revisa que no sea una frase conocida.'
}

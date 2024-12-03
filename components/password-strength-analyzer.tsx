'use client'

import React, { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

/**
 * Tamaños de los conjuntos de caracteres.
 */
const CHAR_SETS = {
  lowercase: 26,
  uppercase: 26,
  numbers: 10,
  symbols: 33
}

/**
 * Intentos por segundo (capacidad de cómputo del atacante).
 */
const ATTEMPTS_PER_SECOND = 1_000_000_000 // Aumentado para reflejar capacidades modernas

/**
 * Tipos para los niveles de fortaleza.
 */
interface StrengthLevel {
  name: string
  color: string
  maxScore: number
}

const strengthLevels: StrengthLevel[] = [
  { name: 'Extremadamente Débil', color: 'text-red-500', maxScore: 20 },
  { name: 'Débil', color: 'text-orange-500', maxScore: 40 },
  { name: 'Medio', color: 'text-yellow-500', maxScore: 60 },
  { name: 'Fuerte', color: 'text-green-500', maxScore: 80 },
  { name: 'Muy Fuerte', color: 'text-blue-500', maxScore: 100 }
]

/**
 * Tipo para el resultado de la función calculatePasswordStrength.
 */
interface PasswordStrengthResult {
  secondsToCrack: number
  strengthLevel: StrengthLevel
  score: number
  possibleCombinations: number
  charSetSize: number
  length: number
  categories: number
}

/**
 * Función para calcular la fortaleza de la contraseña.
 * @param password - Contraseña ingresada por el usuario.
 * @returns Un objeto con detalles sobre la fortaleza de la contraseña.
 */
function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const length = password.length
  const uniqueChars = new Set(password).size

  // Verificar presencia de diferentes tipos de caracteres
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  // Contar cuántas categorías se cumplen
  const categories = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length

  // Penalización si no se cumplen al menos 3 categorías
  let categoryPenalty = 0
  if (categories < 3) {
    categoryPenalty = (3 - categories) * 10 // Penalización por cada categoría faltante
  }

  // Calcular tamaño del conjunto de caracteres
  let charSetSize = 0
  if (hasLowercase) charSetSize += CHAR_SETS.lowercase
  if (hasUppercase) charSetSize += CHAR_SETS.uppercase
  if (hasNumbers) charSetSize += CHAR_SETS.numbers
  if (hasSymbols) charSetSize += CHAR_SETS.symbols

  // Calcular combinaciones posibles
  const possibleCombinations = Math.pow(charSetSize, length)

  // Calcular tiempo en segundos para descifrar
  let secondsToCrack = possibleCombinations / ATTEMPTS_PER_SECOND

  // Penalizar tiempo si la contraseña es débil
  if (categories < 3) {
    secondsToCrack = secondsToCrack / Math.pow(10, 6) // Dividir tiempo por un factor grande
  }

  // Calcular puntaje base
  let score = Math.min(100, length * 5 + categories * 10 + uniqueChars)

  // Aplicar penalización al puntaje
  score = score - categoryPenalty
  score = Math.max(0, score) // Asegurarse de que el puntaje no sea negativo

  // Determinar nivel de fortaleza
  const strengthLevel = strengthLevels.find(level => score <= level.maxScore) || strengthLevels[strengthLevels.length - 1]

  return { secondsToCrack, strengthLevel, score, possibleCombinations, charSetSize, length, categories }
}

/**
 * Función para formatear el tiempo de manera legible.
 * @param seconds - Tiempo en segundos.
 * @returns Una cadena con el tiempo formateado.
 */
function formatTime(seconds: number): string {
  if (seconds < 1) return 'menos de 1 segundo'
  const units = [
    { label: 'años', seconds: 31_536_000 },
    { label: 'días', seconds: 86_400 },
    { label: 'horas', seconds: 3_600 },
    { label: 'minutos', seconds: 60 },
    { label: 'segundos', seconds: 1 }
  ]

  for (const unit of units) {
    if (seconds >= unit.seconds) {
      const value = Math.floor(seconds / unit.seconds)
      return `${value} ${unit.label}`
    }
  }
  return 'menos de 1 segundo'
}

/**
 * Función para validar la contraseña y generar mensajes de error.
 * @param password - Contraseña ingresada por el usuario.
 * @returns Un arreglo de mensajes de error.
 */
function validatePassword(password: string): string[] {
  const errors = []
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres.")
  }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  const categories = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length

  if (categories < 3) {
    errors.push("Incluye al menos 3 de las siguientes categorías: letras mayúsculas, letras minúsculas, números y símbolos.")
  }

  if (/^(.)\1+$/.test(password)) {
    errors.push("La contraseña no debe contener patrones obvios o caracteres repetidos.")
  }

  return errors
}

export default function Component() {
  const [password, setPassword] = useState<string>('')
  const [strength, setStrength] = useState<PasswordStrengthResult>({
    secondsToCrack: 0,
    strengthLevel: strengthLevels[0],
    score: 0,
    possibleCombinations: 0,
    charSetSize: 0,
    length: 0,
    categories: 0
  })
  const [errors, setErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState<boolean>(false)

  useEffect(() => {
    setStrength(calculatePasswordStrength(password))
    setErrors(validatePassword(password))
  }, [password])

  /**
   * Función para generar sugerencias al usuario.
   * @returns Una cadena con sugerencias para mejorar la contraseña.
   */
  const getSuggestion = (): string => {
    if (password.length < 8) return 'Usa al menos 8 caracteres.'
    const suggestions = []
    if (!/[A-Z]/.test(password)) suggestions.push('Añade letras mayúsculas.')
    if (!/[a-z]/.test(password)) suggestions.push('Añade letras minúsculas.')
    if (!/[0-9]/.test(password)) suggestions.push('Añade números.')
    if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Añade símbolos.')
    if (suggestions.length > 0) {
      return suggestions.join(' ')
    }
    return 'Buena contraseña, ¡sigue así!'
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 sm:p-8 relative overflow-hidden flex flex-col">
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Efecto tipo Matrix */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-1 h-1 bg-green-500 opacity-50 animate-matrix"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      <div className="max-w-4xl mx-auto relative z-10 flex-grow">
        <h1 className="text-2xl sm:text-4xl mb-4 sm:mb-8 text-center text-blue-400">Analizador de Fortaleza de Contraseña</h1>
        <div className="mb-8">
          <label htmlFor="password" className="block mb-2">Ingresa tu contraseña:</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border-2 border-green-500 rounded p-2 sm:p-3 text-white focus:outline-none focus:border-blue-400 text-lg pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-green-400 hover:text-blue-400 transition-colors bg-gray-800 bg-opacity-50 hover:bg-opacity-75 rounded-r"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.length > 0 && (
            <div className="mt-2 text-red-500">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>
        <div className="mb-4">
          <Progress value={strength.score} className="h-2" />
        </div>
        <div className="mb-8 text-center">
          <p className="text-xl">
            Nivel: <span className={`font-bold ${strength.strengthLevel.color}`}>
              {strength.strengthLevel.name}
            </span>
          </p>
          <p>Tiempo estimado para descifrar: {formatTime(strength.secondsToCrack)}</p>
          <p className="text-sm mt-2">{getSuggestion()}</p>
        </div>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-900">
                <th className="border border-green-500 p-1 sm:p-2">Nivel</th>
                <th className="border border-green-500 p-1 sm:p-2">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {strengthLevels.map((level, index) => (
                <tr key={index} className="bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition-colors">
                  <td className={`border border-green-500 p-1 sm:p-2 ${level.color}`}>
                    {level.name}
                  </td>
                  <td className="border border-green-500 p-1 sm:p-2 text-cyan-300">
                    {index === 0 ? '≤ 20' : `> ${strengthLevels[index - 1].maxScore} y ≤ ${level.maxScore}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Sección actualizada de Fórmula de Cálculo */}
        <div className="mb-8 bg-gray-900 p-4 rounded-lg border border-green-500">
          <h2 className="text-xl text-blue-400 mb-4">Fórmula de Cálculo</h2>
          <p className="text-lg mb-4">
            El tiempo estimado para descifrar la contraseña se calcula utilizando la siguiente fórmula:
          </p>
          <p className="text-center text-lg font-semibold">
            {"Tiempo estimado = (Tamaño del conjunto de caracteres) ^ (Longitud de la contraseña) ÷ Intentos por segundo"}
          </p>
          <p className="mt-4 text-sm">
            Donde:
            <br />
            - <strong>Tamaño del conjunto de caracteres</strong> ({strength.charSetSize}): Suma de los tipos de caracteres utilizados (letras minúsculas, mayúsculas, números, símbolos).
            <br />
            - <strong>Longitud de la contraseña</strong> ({strength.length}): Número total de caracteres en la contraseña.
            <br />
            - <strong>Intentos por segundo</strong> ({ATTEMPTS_PER_SECOND.toLocaleString()}): Capacidad de cómputo del atacante.
          </p>
          <p className="mt-4 text-sm">
            - <strong>Número total de combinaciones</strong>: {strength.possibleCombinations.toExponential(2)}
          </p>
          <p className="mt-4 text-sm">
            <strong>Nota:</strong> Si la contraseña no incluye al menos 3 categorías de caracteres, se aplica una penalización que reduce significativamente el tiempo estimado para reflejar la mayor facilidad de descifrado.
          </p>
        </div>
        {/* Sección de Reglas del Sistema */}
        <div className="mb-8 bg-gray-900 p-4 rounded-lg border border-green-500">
          <h2 className="text-xl text-blue-400 mb-4">Reglas del Sistema</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>La contraseña debe tener al menos 8 caracteres.</li>
            <li>Se recomienda usar al menos 3 de las siguientes categorías: letras mayúsculas, minúsculas, números y símbolos.</li>
            <li>Se penalizan los patrones obvios y caracteres repetidos.</li>
            <li>La fortaleza se calcula considerando la longitud, la diversidad de caracteres y la complejidad.</li>
            <li>El tiempo de descifrado se estima basado en ataques de fuerza bruta modernos.</li>
          </ul>
        </div>
      </div>
      {/* Pie de página */}
      <footer className="relative z-10 mt-12 pt-8 border-t border-green-500">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-blue-400">{'>'}</span>
              <span>J. Santiago Ravelo</span>
              <Link href="https://github.com/JunniorRavelo" className="text-green-400 hover:text-blue-400 transition-colors">GitHub</Link>
              <Link href="https://www.linkedin.com/in/jsravelo/" className="text-green-400 hover:text-blue-400 transition-colors">LinkedIn</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-400">{'>'}</span>
              <span>Omar Castro</span>
              <Link href="https://github.com/omarcastro2002" className="text-green-400 hover:text-blue-400 transition-colors">GitHub</Link>
              <Link href="https://www.linkedin.com/in/omar-castro-6b4ba8207/" className="text-green-400 hover:text-blue-400 transition-colors">LinkedIn</Link>
            </div>
          </div>
          <div className="flex flex-col justify-center items-end">
            <p className="text-right text-sm">
              <span className="text-blue-400">{'$'}</span> Ingeniería de Sistemas
            </p>
            <p className="text-right text-sm">
              <span className="text-blue-400">{'$'}</span> Universidad de Pamplona, Colombia - Cúcuta
            </p>
          </div>
        </div>
        <div className="mt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Cybernetic Password Strength Analyzer</p>
        </div>
      </footer>
    </div>
  )
}

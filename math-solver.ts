import { evaluate, simplify, derivative, parse } from 'mathjs'

export interface MathResult {
  input: string
  result: string
  steps?: string[]
  error?: string
  timestamp: Date
}

export function solveMathProblem(input: string): MathResult {
  const cleanInput = input.trim()
  
  if (!cleanInput) {
    return {
      input: '',
      result: '',
      error: 'Por favor, ingresa un problema matemático',
      timestamp: new Date()
    }
  }

  try {
    // Try to evaluate the expression
    const result = evaluate(cleanInput)
    
    const steps: string[] = []
    steps.push(`Expresión: ${cleanInput}`)
    
    // Try to simplify if it's an expression
    try {
      const simplified = simplify(cleanInput).toString()
      if (simplified !== cleanInput && simplified !== String(result)) {
        steps.push(`Simplificado: ${simplified}`)
      }
    } catch {
      // Ignore simplification errors
    }
    
    steps.push(`Resultado: ${result}`)

    return {
      input: cleanInput,
      result: String(result),
      steps,
      timestamp: new Date()
    }
  } catch (evalError) {
    // Try to parse and simplify algebraic expressions
    try {
      const parsed = parse(cleanInput)
      const simplified = simplify(parsed).toString()
      
      return {
        input: cleanInput,
        result: simplified,
        steps: [
          `Expresión: ${cleanInput}`,
          `Simplificado: ${simplified}`
        ],
        timestamp: new Date()
      }
    } catch {
      // Try derivative if it contains 'derivative' or 'd/dx'
      if (cleanInput.toLowerCase().includes('derivada') || cleanInput.includes('d/dx')) {
        try {
          const expr = cleanInput
            .replace(/derivada\s*(de)?\s*/i, '')
            .replace(/d\/dx\s*/i, '')
            .trim()
          const deriv = derivative(expr, 'x').toString()
          
          return {
            input: cleanInput,
            result: deriv,
            steps: [
              `Expresión original: ${expr}`,
              `Derivada respecto a x: ${deriv}`
            ],
            timestamp: new Date()
          }
        } catch {
          // Ignore derivative errors
        }
      }
      
      return {
        input: cleanInput,
        result: '',
        error: 'No se pudo resolver la expresión. Verifica la sintaxis.',
        timestamp: new Date()
      }
    }
  }
}

export function extractMathFromText(text: string): string {
  // Clean OCR text and extract mathematical expressions
  let cleaned = text
    .replace(/[oO]/g, '0') // Common OCR mistakes
    .replace(/[lI]/g, '1')
    .replace(/[Ss]/g, '5')
    .replace(/[Bb]/g, '8')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Try to find mathematical expressions
  const mathPattern = /[\d\+\-\*\/\^\(\)\.\s=x]+/gi
  const matches = cleaned.match(mathPattern)
  
  if (matches && matches.length > 0) {
    // Return the longest match (likely the main expression)
    return matches.reduce((a, b) => a.length > b.length ? a : b).trim()
  }
  
  return cleaned
}

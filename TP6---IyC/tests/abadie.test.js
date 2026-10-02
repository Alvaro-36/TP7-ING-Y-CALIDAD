// M05-US2 Escenario 2 - Tests unitarios de validarMotivoCancelacion y normalizarMotivo (Jest, ESM)
import { validarMotivoCancelacion, normalizarMotivo, MAX_MOTIVO } from '../src/logica-negocio.js'

const LARGO_200 = 'a'.repeat(200)
const LARGO_201 = 'a'.repeat(201)
const ERROR_TOO_LONG = 'El motivo no puede superar los 200 caracteres'

describe('validarMotivoCancelacion', () => {
  test('motivo undefined es válido porque el motivo es opcional', () => {
    expect(validarMotivoCancelacion(undefined)).toStrictEqual({ valido: true, error: null })
  })

  test('motivo null es válido porque el motivo es opcional', () => {
    expect(validarMotivoCancelacion(null)).toStrictEqual({ valido: true, error: null })
  })

  test('motivo vacío es válido', () => {
    expect(validarMotivoCancelacion('')).toStrictEqual({ valido: true, error: null })
  })

  test('un motivo común de texto es válido', () => {
    expect(validarMotivoCancelacion('El cliente reprogramó')).toStrictEqual({ valido: true, error: null })
  })

  test('un motivo de exactamente 200 caracteres es válido (caso límite)', () => {
    expect(LARGO_200).toHaveLength(MAX_MOTIVO)
    expect(validarMotivoCancelacion(LARGO_200)).toStrictEqual({ valido: true, error: null })
  })

  test('un motivo de 201 caracteres es inválido y devuelve el mensaje de error', () => {
    expect(LARGO_201).toHaveLength(MAX_MOTIVO + 1)
    expect(validarMotivoCancelacion(LARGO_201)).toStrictEqual({ valido: false, error: ERROR_TOO_LONG })
  })

  test('el límite se cuenta sobre el motivo ya recortado, no sobre los espacios exteriores', () => {
    expect(validarMotivoCancelacion(`   ${LARGO_200}   `)).toStrictEqual({ valido: true, error: null })
  })

  test('no lanza excepción ante un motivo que no es string y devuelve el objeto resultado', () => {
    expect(() => validarMotivoCancelacion(12345)).not.toThrow()
    expect(validarMotivoCancelacion(12345)).toStrictEqual({ valido: true, error: null })
    expect(() => validarMotivoCancelacion({})).not.toThrow()
    expect(validarMotivoCancelacion({})).toStrictEqual({ valido: true, error: null })
  })

  test('no muta el motivo recibido', () => {
    const motivo = `  ${LARGO_201}  `
    const copia = motivo
    validarMotivoCancelacion(motivo)
    expect(motivo).toBe(copia)
    expect(motivo).toHaveLength(LARGO_201.length + 4)
  })
})

describe('normalizarMotivo', () => {
  test('motivo null devuelve null', () => {
    expect(normalizarMotivo(null)).toBeNull()
  })

  test('motivo undefined devuelve null', () => {
    expect(normalizarMotivo(undefined)).toBeNull()
  })

  test('motivo vacío devuelve null', () => {
    expect(normalizarMotivo('')).toBeNull()
  })

  test('un motivo con solo espacios devuelve null porque queda vacío tras el trim', () => {
    expect(normalizarMotivo('   ')).toBeNull()
  })

  test('un motivo común se devuelve sin cambios', () => {
    expect(normalizarMotivo('El cliente reprogramó')).toBe('El cliente reprogramó')
  })

  test('recorta los espacios exteriores y colapsa los espacios internos múltiples', () => {
    expect(normalizarMotivo('  El   cliente  reprogramó  ')).toBe('El cliente reprogramó')
  })

  test('colapsa una corrida larga de espacios internos a un solo espacio', () => {
    expect(normalizarMotivo('hola          mundo')).toBe('hola mundo')
  })

  test('un motivo de 200 caracteres sin espacios se devuelve intacto', () => {
    expect(normalizarMotivo(LARGO_200)).toBe(LARGO_200)
  })

  test('conserva los saltos de línea y los tabs internos', () => {
    expect(normalizarMotivo('linea 1\nlinea 2')).toBe('linea 1\nlinea 2')
    expect(normalizarMotivo('columna 1\tcolumna 2')).toBe('columna 1\tcolumna 2')
  })

  test('no muta el motivo recibido', () => {
    const motivo = '  hola    mundo  '
    const original = motivo
    const resultado = normalizarMotivo(motivo)
    expect(resultado).toBe('hola mundo')
    expect(motivo).toBe(original)
    expect(motivo).toHaveLength(original.length)
  })

  test('es idempotente: normalizar dos veces da el mismo resultado', () => {
    const unaVez = normalizarMotivo('  a   b     c  ')
    expect(normalizarMotivo(unaVez)).toBe(unaVez)
    expect(unaVez).toBe('a b c')
  })
})

describe('validarMotivoCancelacion y normalizarMotivo - casos borde', () => {
  test('el límite se mide sobre el texto crudo, no sobre el texto normalizado', () => {
    // 30 bloques de 5 letras unidos con 2 espacios: 150 letras y 58 espacios en crudo.
    const conEspaciosDeMas = Array.from({ length: 30 }, () => 'abcde').join('  ')
    const normalizado = normalizarMotivo(conEspaciosDeMas)

    // Comportamiento real y actual: validarMotivoCancelacion hace String(motivo).trim().length,
    // es decir cuenta el texto tal como llega, SIN colapsar los espacios internos primero.
    expect(conEspaciosDeMas).toHaveLength(208)
    expect(validarMotivoCancelacion(conEspaciosDeMas)).toStrictEqual({
      valido: false,
      error: ERROR_TOO_LONG,
    })

    // El mismo motivo ya normalizado entra perfecto en el límite: 179 caracteres.
    expect(normalizado).toHaveLength(179)
    expect(validarMotivoCancelacion(normalizado)).toStrictEqual({ valido: true, error: null })
  })

  test('el tab cuenta como un carácter y normalizarMotivo lo preserva sin colapsar', () => {
    const alLimite = `${'a'.repeat(198)}\ta`
    const excedido = `${'a'.repeat(198)}\taa`

    // String.prototype.length cuenta el tab como un carácter y replace(/ +/g, ' ') no lo toca.
    expect(alLimite).toHaveLength(200)
    expect(validarMotivoCancelacion(alLimite)).toStrictEqual({ valido: true, error: null })
    expect(normalizarMotivo(alLimite)).toBe(alLimite)

    expect(excedido).toHaveLength(201)
    expect(validarMotivoCancelacion(excedido)).toStrictEqual({ valido: false, error: ERROR_TOO_LONG })
    expect(normalizarMotivo(excedido)).toBe(excedido)
  })

  test('el salto de línea cuenta como un carácter y normalizarMotivo lo preserva sin colapsar', () => {
    const alLimite = `${'a'.repeat(198)}\na`
    const excedido = `${'a'.repeat(198)}\naa`

    expect(alLimite).toHaveLength(200)
    expect(validarMotivoCancelacion(alLimite)).toStrictEqual({ valido: true, error: null })
    expect(normalizarMotivo(alLimite)).toBe(alLimite)

    expect(excedido).toHaveLength(201)
    expect(validarMotivoCancelacion(excedido)).toStrictEqual({ valido: false, error: ERROR_TOO_LONG })
    expect(normalizarMotivo(excedido)).toBe(excedido)
  })

  test('el conteo de longitud es por unidades UTF-16, no por caracteres percibidos', () => {
    // Limitación conocida: un emoji astral ocupa 2 unidades UTF-16, así que .length lo cuenta doble.
    // 100 emojis miden 200 unidades (válido) aunque el usuario perciba 100 caracteres.
    // 101 emojis miden 202 unidades (inválido) aunque el usuario perciba 101 caracteres.
    const cienEmojis = '\u{1F600}'.repeat(100)
    const cientoUnoEmojis = '\u{1F600}'.repeat(101)

    expect(cienEmojis).toHaveLength(200)
    expect(validarMotivoCancelacion(cienEmojis)).toStrictEqual({ valido: true, error: null })

    expect(cientoUnoEmojis).toHaveLength(202)
    expect(validarMotivoCancelacion(cientoUnoEmojis)).toStrictEqual({
      valido: false,
      error: ERROR_TOO_LONG,
    })
  })

  test('validar y luego normalizar sobre el mismo motivo da resultados coherentes', () => {
    const motivo = '  motivo   válido  '

    // Es la secuencia que usa la UI: valida el crudo (app.js) y guarda el normalizado.
    const validacion = validarMotivoCancelacion(motivo)
    const normalizado = normalizarMotivo(motivo)

    expect(validacion).toStrictEqual({ valido: true, error: null })
    expect(normalizado).toBe('motivo válido')

    // Normalizar nunca empeora un motivo que ya era válido.
    expect(validarMotivoCancelacion(normalizado)).toStrictEqual({ valido: true, error: null })
    expect(normalizado.length).toBeLessThanOrEqual(motivo.trim().length)
  })
})

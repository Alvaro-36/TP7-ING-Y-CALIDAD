import { cambiarMes, generarDiasDelMes } from '../src/logica-negocio.js'

describe('cambiarMes', () => {
  // Casos normales
  it('avanza un mes dentro del mismo año', () => {
    expect(cambiarMes(5, 2026, 1)).toEqual({ mes: 6, anio: 2026 })
  })

  it('lanza error si el mes es NaN', () => {
  expect(() => cambiarMes(NaN, 2026, 1)).toThrow('Mes inválido')
})

it('valida primero el mes y después el año', () => {
  expect(() => cambiarMes(13, 2026.5, 1)).toThrow('Mes inválido')
})

  it('retrocede varios meses dentro del mismo año', () => {
    expect(cambiarMes(5, 2026, -2)).toEqual({ mes: 3, anio: 2026 })
  })

  // Casos borde
  it('pasa de diciembre a enero del año siguiente', () => {
    expect(cambiarMes(12, 2026, 1)).toEqual({ mes: 1, anio: 2027 })
  })

  it('pasa de enero a diciembre del año anterior', () => {
    expect(cambiarMes(1, 2026, -1)).toEqual({ mes: 12, anio: 2025 })
  })

  it('con delta 0 devuelve el mismo mes y año', () => {
    expect(cambiarMes(7, 2026, 0)).toEqual({ mes: 7, anio: 2026 })
  })

  it('maneja deltas mayores a 12 meses', () => {
    expect(cambiarMes(10, 2026, 14)).toEqual({ mes: 12, anio: 2027 })
    expect(cambiarMes(3, 2026, -12)).toEqual({ mes: 3, anio: 2025 })
  })

  // Casos inválidos
  it('lanza error si el mes está fuera de rango', () => {
    expect(() => cambiarMes(0, 2026, 1)).toThrow('Mes inválido')
    expect(() => cambiarMes(13, 2026, 1)).toThrow('Mes inválido')
  })

  it('lanza error si el mes no es un entero', () => {
    expect(() => cambiarMes(1.5, 2026, 1)).toThrow('Mes inválido')
    expect(() => cambiarMes('5', 2026, 1)).toThrow('Mes inválido')
  })

  it('lanza error si el año no es un entero', () => {
    expect(() => cambiarMes(5, 2026.5, 1)).toThrow('Año inválido')
    expect(() => cambiarMes(5, undefined, 1)).toThrow('Año inválido')
  })

  it('lanza error si delta no es un entero', () => {
    expect(() => cambiarMes(5, 2026, 1.5)).toThrow('Delta inválido')
    expect(() => cambiarMes(5, 2026, undefined)).toThrow('Delta inválido')
  })

  // No mutación
  it('modificar el resultado no afecta a llamadas posteriores', () => {
  const r1 = cambiarMes(5, 2026, 1)
  r1.mes = 99
  expect(cambiarMes(5, 2026, 1)).toEqual({ mes: 6, anio: 2026 })
})
})

describe('generarDiasDelMes', () => {
  // Casos normales
  it('genera 31 días para octubre de 2026', () => {
    const dias = generarDiasDelMes(10, 2026)
    expect(dias).toHaveLength(31)
    expect(dias[0]).toBe('2026-10-01')
    expect(dias[30]).toBe('2026-10-31')
  })

  it('genera 30 días para abril de 2026', () => {
    const dias = generarDiasDelMes(4, 2026)
    expect(dias).toHaveLength(30)
    expect(dias[29]).toBe('2026-04-30')
  })

  it('devuelve los días en orden consecutivo con formato YYYY-MM-DD', () => {
    const dias = generarDiasDelMes(3, 2026)
    dias.forEach((fecha, i) => {
      expect(fecha).toBe(`2026-03-${String(i + 1).padStart(2, '0')}`)
    })
  })

  // Casos borde
  it('genera 28 días para febrero de un año no bisiesto (2026)', () => {
    const dias = generarDiasDelMes(2, 2026)
    expect(dias).toHaveLength(28)
    expect(dias[27]).toBe('2026-02-28')
  })

  it('genera 29 días para febrero de un año bisiesto (2028)', () => {
    const dias = generarDiasDelMes(2, 2028)
    expect(dias).toHaveLength(29)
    expect(dias[28]).toBe('2028-02-29')
  })

  it('respeta la regla de siglos: 2100 no es bisiesto y 2000 sí', () => {
    expect(generarDiasDelMes(2, 2100)).toHaveLength(28)
    expect(generarDiasDelMes(2, 2000)).toHaveLength(29)
  })

  it('genera correctamente enero y diciembre', () => {
    expect(generarDiasDelMes(1, 2026)[0]).toBe('2026-01-01')
    expect(generarDiasDelMes(12, 2026)[30]).toBe('2026-12-31')
  })

  // Casos inválidos
  it('lanza error si el mes está fuera de rango', () => {
    expect(() => generarDiasDelMes(0, 2026)).toThrow('Mes inválido')
    expect(() => generarDiasDelMes(13, 2026)).toThrow('Mes inválido')
  })

  it('lanza error si el mes no es un entero', () => {
    expect(() => generarDiasDelMes('a', 2026)).toThrow('Mes inválido')
    expect(() => generarDiasDelMes(2.5, 2026)).toThrow('Mes inválido')
  })

  it('lanza error si el año no es un entero', () => {
    expect(() => generarDiasDelMes(5, 2026.5)).toThrow('Año inválido')
    expect(() => generarDiasDelMes(5, null)).toThrow('Año inválido')
  })

  // No mutación
  it('devuelve un array nuevo en cada llamada', () => {
    const a1 = generarDiasDelMes(10, 2026)
    const a2 = generarDiasDelMes(10, 2026)
    expect(a1).toEqual(a2)
    expect(a1).not.toBe(a2)
  })
})
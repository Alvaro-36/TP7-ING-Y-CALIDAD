import { obtenerReservasDelDia, ordenarPorHora } from '../src/logica-negocio.js'

describe('obtenerReservasDelDia', () => {
  it('devuelve únicamente las reservas correspondientes a la fecha solicitada (caso normal)', () => {
    const reservas = [
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
      { id: 2, fecha: '2026-10-15', hora: '11:00' },
      { id: 3, fecha: '2026-10-14', hora: '12:00' },
    ]
    const resultado = obtenerReservasDelDia(reservas, '2026-10-14')
    expect(resultado).toEqual([
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
      { id: 3, fecha: '2026-10-14', hora: '12:00' },
    ])
  })

  it('devuelve un array vacío si ninguna reserva corresponde a la fecha (caso límite)', () => {
    const reservas = [
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
    ]
    const resultado = obtenerReservasDelDia(reservas, '2026-10-16')
    expect(resultado).toEqual([])
  })

  it('devuelve un array con un único elemento si existe solo una reserva en esa fecha (caso límite)', () => {
    const reservas = [
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
      { id: 2, fecha: '2026-10-15', hora: '11:00' },
    ]
    const resultado = obtenerReservasDelDia(reservas, '2026-10-15')
    expect(resultado).toEqual([
      { id: 2, fecha: '2026-10-15', hora: '11:00' },
    ])
  })

  it('devuelve un array vacío para entradas inválidas de fecha ya que no coinciden exactamente (comportamiento observable)', () => {
    const reservas = [
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
    ]
    expect(obtenerReservasDelDia(reservas, '')).toEqual([])
    expect(obtenerReservasDelDia(reservas, null)).toEqual([])
    expect(obtenerReservasDelDia(reservas, 'invalid-date')).toEqual([])
  })

  it('lanza TypeError si la lista de reservas es nula o indefinida', () => {
    expect(() => obtenerReservasDelDia(null, '2026-10-14')).toThrow(TypeError)
    expect(() => obtenerReservasDelDia(undefined, '2026-10-14')).toThrow(TypeError)
  })

  it('no modifica el array original ni sus elementos', () => {
    const reservas = [
      { id: 1, fecha: '2026-10-14', hora: '10:00' },
      { id: 2, fecha: '2026-10-15', hora: '11:00' },
    ]
    const copia = structuredClone(reservas)
    
    obtenerReservasDelDia(reservas, '2026-10-14')
    
    expect(reservas).toEqual(copia)
  })
})

describe('ordenarPorHora', () => {
  it('ordena correctamente varias reservas con diferentes horarios (caso normal)', () => {
    const reservas = [
      { id: 1, hora: '15:00' },
      { id: 2, hora: '09:00' },
      { id: 3, hora: '11:30' },
    ]
    const resultado = ordenarPorHora(reservas)
    expect(resultado).toEqual([
      { id: 2, hora: '09:00' },
      { id: 3, hora: '11:30' },
      { id: 1, hora: '15:00' },
    ])
  })

  it('devuelve un array vacío si la entrada es un array vacío (caso límite)', () => {
    expect(ordenarPorHora([])).toEqual([])
  })

  it('devuelve un array con una sola reserva sin errores (caso límite)', () => {
    const reservas = [{ id: 1, hora: '10:00' }]
    const resultado = ordenarPorHora(reservas)
    expect(resultado).toEqual([{ id: 1, hora: '10:00' }])
  })

  it('mantiene el orden estable u ordena correctamente al haber horarios iguales (caso límite)', () => {
    const reservas = [
      { id: 1, hora: '10:00' },
      { id: 2, hora: '09:00' },
      { id: 3, hora: '10:00' },
    ]
    const resultado = ordenarPorHora(reservas)
    expect(resultado).toEqual([
      { id: 2, hora: '09:00' },
      { id: 1, hora: '10:00' },
      { id: 3, hora: '10:00' },
    ])
  })

  it('lanza TypeError si la lista de reservas es nula o indefinida (al usar spread operator)', () => {
    // Debido a la implementación [...reservas], lanza TypeError si el objeto no es iterable
    expect(() => ordenarPorHora(null)).toThrow(TypeError)
    expect(() => ordenarPorHora(undefined)).toThrow(TypeError)
  })

  it('no modifica el array original ni su orden', () => {
    const reservas = [
      { id: 1, hora: '15:00' },
      { id: 2, hora: '09:00' },
    ]
    const copia = structuredClone(reservas)
    
    ordenarPorHora(reservas)
    
    expect(reservas).toEqual(copia)
  })
})

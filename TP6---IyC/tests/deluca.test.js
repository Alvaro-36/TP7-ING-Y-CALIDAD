import { esReservaPasada, puedeCancelar } from '../src/logica-negocio.js'
import { jest } from '@jest/globals'

const reserva = (cambios = {}) => ({
  id: 'r-prueba',
  fecha: '2026-09-10',
  hora: '14:00',
  cliente: 'Ana Torres',
  telefono: '2615550000',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
  ...cambios,
})

describe('esReservaPasada', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-10T10:00:00'))
  })

  afterEach(() => jest.useRealTimers())

  it('devuelve true para una reserva de un día anterior', () => {
    expect(esReservaPasada(reserva({ fecha: '2026-09-09' }))).toBe(true)
  })

  it('devuelve false cuando la reserva es exactamente ahora', () => {
    expect(esReservaPasada(reserva({ hora: '10:00' }))).toBe(false)
  })

  it('devuelve false para una reserva futura y no modifica sus datos', () => {
    const futura = reserva({ hora: '14:00' })
    const copia = structuredClone(futura)

    expect(esReservaPasada(futura)).toBe(false)
    expect(futura).toEqual(copia)
  })

  it('lanza el error esperado si la reserva es inválida', () => {
    expect(() => esReservaPasada(null)).toThrow('Reserva inválida')
  })
})

describe('puedeCancelar', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-10T10:00:00'))
  })

  afterEach(() => jest.useRealTimers())

  it('permite cancelar una reserva futura pendiente', () => {
    expect(puedeCancelar(reserva())).toBe(true)
  })

  it('no permite cancelar una reserva pasada', () => {
    expect(puedeCancelar(reserva({ fecha: '2026-09-09' }))).toBe(false)
  })

  it.each(['Cancelada', 'Completado'])('no permite cancelar una reserva %s', (estado) => {
    expect(puedeCancelar(reserva({ estado }))).toBe(false)
  })

  it('lanza el error esperado si la reserva es inválida', () => {
    expect(() => puedeCancelar(undefined)).toThrow('Reserva inválida')
  })
})

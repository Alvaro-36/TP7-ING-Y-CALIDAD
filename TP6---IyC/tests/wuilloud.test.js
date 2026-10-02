// M05-US2 - Tests unitarios de cancelarReserva y liberarSlot (Jest, ESM)
import { cancelarReserva, liberarSlot } from '../src/logica-negocio.js'

const reservaBase = () => ({
  id: 2,
  fecha: '2026-10-15',
  hora: '09:00',
  cliente: 'Luis Pérez',
  telefono: '2615552222',
  tipoEvento: 'Consulta general',
  estado: 'Confirmada',
  motivoCancelacion: null,
})

const slotsBase = () => [
  { hora: '09:00', estado: 'Reservado' },
  { hora: '10:00', estado: 'Reservado' },
  { hora: '11:00', estado: 'Disponible' },
]

describe('cancelarReserva', () => {
  test('cancela una reserva confirmada y guarda el motivo', () => {
    const resultado = cancelarReserva(reservaBase(), 'El cliente viajó')
    expect(resultado).toEqual({ ...reservaBase(), estado: 'Cancelada', motivoCancelacion: 'El cliente viajó' })
  })

  test('cancela una reserva pendiente', () => {
    const resultado = cancelarReserva({ ...reservaBase(), estado: 'Pendiente' }, 'x')
    expect(resultado.estado).toBe('Cancelada')
  })

  test('sin motivo guarda motivoCancelacion en null', () => {
    expect(cancelarReserva(reservaBase()).motivoCancelacion).toBeNull()
    expect(cancelarReserva(reservaBase(), undefined).motivoCancelacion).toBeNull()
    expect(cancelarReserva(reservaBase(), null).motivoCancelacion).toBeNull()
  })

  test('devuelve un objeto nuevo y no muta la reserva original', () => {
    const original = reservaBase()
    const copia = structuredClone(original)
    const resultado = cancelarReserva(original, 'motivo')
    expect(resultado).not.toBe(original)
    expect(original).toEqual(copia)
  })

  test('lanza error si la reserva ya está cancelada', () => {
    expect(() => cancelarReserva({ ...reservaBase(), estado: 'Cancelada' })).toThrow('La reserva ya está cancelada')
  })

  test('lanza error si la reserva está completada', () => {
    expect(() => cancelarReserva({ ...reservaBase(), estado: 'Completado' })).toThrow('No se puede cancelar una reserva completada')
  })

  test('lanza error si la reserva es null o undefined', () => {
    expect(() => cancelarReserva(null)).toThrow('Reserva inválida')
    expect(() => cancelarReserva(undefined)).toThrow('Reserva inválida')
  })
})

describe('liberarSlot', () => {
  test('pone en Disponible el slot de la hora de la reserva y deja el resto igual', () => {
    expect(liberarSlot(slotsBase(), reservaBase())).toEqual([
      { hora: '09:00', estado: 'Disponible' },
      { hora: '10:00', estado: 'Reservado' },
      { hora: '11:00', estado: 'Disponible' },
    ])
  })

  test('si la hora no existe devuelve una copia sin cambios', () => {
    const slots = slotsBase()
    const resultado = liberarSlot(slots, { ...reservaBase(), hora: '11:30' })
    expect(resultado).toEqual(slotsBase())
    expect(resultado).not.toBe(slots)
  })

  test('con un array de slots vacío devuelve un array vacío', () => {
    expect(liberarSlot([], reservaBase())).toEqual([])
  })

  test('liberar un slot que ya estaba Disponible no cambia nada', () => {
    const resultado = liberarSlot(slotsBase(), { ...reservaBase(), hora: '11:00' })
    expect(resultado).toEqual(slotsBase())
  })

  test('no muta el array original ni sus slots', () => {
    const slots = slotsBase()
    const primerSlot = slots[0]
    liberarSlot(slots, reservaBase())
    expect(slots).toEqual(slotsBase())
    expect(slots[0]).toBe(primerSlot)
    expect(primerSlot.estado).toBe('Reservado')
  })

  test('lanza error si la reserva es null', () => {
    expect(() => liberarSlot(slotsBase(), null)).toThrow(TypeError)
  })

  test('lanza error si slots no es un array', () => {
    expect(() => liberarSlot(null, reservaBase())).toThrow(TypeError)
  })
})

import { describe, expect, it } from 'vitest'
import { generarSlots, reagendarReserva } from '../src/logica-negocio.js'

describe('INC-0522: reagendar una reserva libera el horario original', () => {
  it('ocupa el horario nuevo y deja disponible el anterior', () => {
    const fechaA = '2026-10-13'
    const fechaB = '2026-10-14'
    const reservas = [
      {
        id: 1,
        fecha: fechaA,
        hora: '10:00',
        estado: 'Confirmada',
      },
    ]

    const resultado = reagendarReserva(reservas, 1, fechaB, '15:00')
    const slotB = generarSlots(resultado.filter((r) => r.fecha === fechaB))
      .find((slot) => slot.hora === '15:00')
    const slotA = generarSlots(resultado.filter((r) => r.fecha === fechaA))
      .find((slot) => slot.hora === '10:00')

    expect(slotB.estado).toBe('Reservado')
    expect(slotA.estado).toBe('Disponible')
  })
})
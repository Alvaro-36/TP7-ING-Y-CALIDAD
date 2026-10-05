import { obtenerReservaPorId, reservasDePrueba } from '../src/logica-negocio.js'
import { describe, expect, it } from 'vitest'

describe('INC-0000: obtenerReservaPorId con ID numerico o string', () => {
  it('encuentra la reserva aunque el id se pase como string', () => {
    const reserva = obtenerReservaPorId(reservasDePrueba, '2')
    expect(reserva).not.toBeNull()
    expect(reserva?.id).toBe(2)
  })
})

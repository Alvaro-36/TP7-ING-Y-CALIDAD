// Tests unitarios de M05-US09 Escenario 2 (día sin reservas): filtrarPorEstado y esMismoDia (Jest, ESM).
import { filtrarPorEstado, esMismoDia } from '../src/logica-negocio.js'

const reserva = (id, estado) => ({
  id, fecha: '2026-10-15', hora: '10:00', cliente: `Cliente ${id}`, telefono: '', tipoEvento: 'Consulta general',
  estado, motivoCancelacion: null,
})

describe('filtrarPorEstado', () => {
  it('devuelve solo las reservas con el estado pedido', () => {
    // Arrange
    const reservas = [reserva(1, 'Confirmada'), reserva(2, 'Pendiente'), reserva(3, 'Confirmada'), reserva(4, 'Cancelada')]

    // Act
    const resultado = filtrarPorEstado(reservas, 'Confirmada')

    // Assert
    expect(resultado.map((r) => r.id)).toEqual([1, 3])
  })

  it('devuelve un array vacío si no hay reservas o ninguna tiene ese estado', () => {
    // Arrange
    const reservas = [reserva(1, 'Pendiente')]

    // Act
    const deVacio = filtrarPorEstado([], 'Pendiente')
    const sinCoincidencias = filtrarPorEstado(reservas, 'Completado')

    // Assert
    expect(deVacio).toEqual([])
    expect(sinCoincidencias).toEqual([])
  })

  it('distingue mayúsculas: "confirmada" no coincide con "Confirmada"', () => {
    // Arrange
    const reservas = [reserva(1, 'Confirmada')]

    // Act
    const resultado = filtrarPorEstado(reservas, 'confirmada')

    // Assert
    expect(resultado).toEqual([])
  })

  it('no muta el array original y devuelve uno nuevo', () => {
    // Arrange
    const reservas = [reserva(1, 'Confirmada'), reserva(2, 'Cancelada')]
    const copia = structuredClone(reservas)

    // Act
    const resultado = filtrarPorEstado(reservas, 'Confirmada')

    // Assert
    expect(reservas).toEqual(copia)
    expect(resultado).not.toBe(reservas)
  })

  it('lanza TypeError si recibe null en lugar de un array', () => {
    // Arrange
    const reservas = null

    // Act + Assert
    expect(() => filtrarPorEstado(reservas, 'Confirmada')).toThrow(TypeError)
  })
})

describe('esMismoDia', () => {
  it('devuelve true para dos strings iguales y false para días distintos', () => {
    // Arrange
    const dia = '2026-10-15'

    // Act
    const mismo = esMismoDia(dia, '2026-10-15')
    const distinto = esMismoDia(dia, '2026-10-16')

    // Assert
    expect(mismo).toBe(true)
    expect(distinto).toBe(false)
  })

  it('compara un Date con un string del mismo día, sin importar la hora (00:00 y 23:59)', () => {
    // Arrange: fechas construidas en hora local
    const inicio = new Date(2026, 9, 15, 0, 0)
    const fin = new Date(2026, 9, 15, 23, 59)

    // Act
    const inicioVsString = esMismoDia(inicio, '2026-10-15')
    const finVsString = esMismoDia('2026-10-15', fin)
    const inicioVsFin = esMismoDia(inicio, fin)

    // Assert
    expect(inicioVsString).toBe(true)
    expect(finVsString).toBe(true)
    expect(inicioVsFin).toBe(true)
  })

  it('distingue el último minuto de un día del primero del día siguiente', () => {
    // Arrange
    const ultimoMinuto = new Date(2026, 9, 15, 23, 59, 59)
    const primerMinuto = new Date(2026, 9, 16, 0, 0, 0)

    // Act
    const resultado = esMismoDia(ultimoMinuto, primerMinuto)

    // Assert
    expect(resultado).toBe(false)
  })

  it('devuelve false si un string no es una fecha válida', () => {
    // Arrange
    const invalida = 'no-es-una-fecha'

    // Act
    const resultado = esMismoDia(invalida, '2026-10-15')

    // Assert
    expect(resultado).toBe(false)
  })

  it('lanza TypeError si recibe null', () => {
    // Arrange
    const fecha = null

    // Act + Assert
    expect(() => esMismoDia(fecha, '2026-10-15')).toThrow(TypeError)
  })
})

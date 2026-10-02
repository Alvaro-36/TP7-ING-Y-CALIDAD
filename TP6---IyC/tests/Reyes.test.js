import { diasConReservas, tamanoIndicador } from '../src/logica-negocio.js'

describe('diasConReservas', () => {
  it('cuenta las reservas activas de cada día del mes indicado', () => {
    const reservas = [
      { fecha: '2026-10-14', estado: 'Confirmada' },
      { fecha: '2026-10-14', estado: 'Pendiente' },
      { fecha: '2026-10-15', estado: 'Confirmada' },
      { fecha: '2026-11-14', estado: 'Confirmada' },
    ]

    expect(diasConReservas(reservas, 10, 2026)).toEqual({
      '2026-10-14': 2,
      '2026-10-15': 1,
    })
  })

  it('devuelve un objeto vacío si el mes no tiene reservas activas', () => {
    const reservas = [{ fecha: '2026-10-14', estado: 'Confirmada' }]

    expect(diasConReservas(reservas, 11, 2026)).toEqual({})
    expect(diasConReservas([], 10, 2026)).toEqual({})
  })

  it('ignora las reservas canceladas al contar los días', () => {
    const reservas = [
      { fecha: '2026-10-14', estado: 'Cancelada' },
      { fecha: '2026-10-14', estado: 'Confirmada' },
    ]

    expect(diasConReservas(reservas, 10, 2026)).toEqual({ '2026-10-14': 1 })
  })

  it('no modifica el array original ni sus reservas', () => {
    const reservas = [
      { fecha: '2026-10-14', estado: 'Confirmada' },
      { fecha: '2026-10-14', estado: 'Cancelada' },
    ]
    const copia = structuredClone(reservas)

    diasConReservas(reservas, 10, 2026)

    expect(reservas).toEqual(copia)
  })

  it('lanza TypeError si la lista de reservas es inválida', () => {
    expect(() => diasConReservas(null, 10, 2026)).toThrow(TypeError)
  })
})

describe('tamanoIndicador', () => {
  it('devuelve el tamaño esperado para cantidades normales', () => {
    expect(tamanoIndicador(1)).toBe('sm')
    expect(tamanoIndicador(2)).toBe('md')
    expect(tamanoIndicador(4)).toBe('lg')
  })

  it('cambia de tamaño justo después de cada límite', () => {
    expect(tamanoIndicador(1)).toBe('sm')
    expect(tamanoIndicador(2)).toBe('md')
    expect(tamanoIndicador(3)).toBe('md')
    expect(tamanoIndicador(4)).toBe('lg')
  })

  it('clasifica cero como tamaño pequeño', () => {
    expect(tamanoIndicador(0)).toBe('sm')
  })

  it('clasifica NaN como tamaño grande según las comparaciones actuales', () => {
    expect(tamanoIndicador(Number.NaN)).toBe('lg')
  })
})

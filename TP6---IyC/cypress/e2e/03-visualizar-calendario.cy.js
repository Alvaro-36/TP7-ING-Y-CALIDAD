const reservas = [
  {
    id: 1,
    fecha: '2026-11-12',
    hora: '10:00',
    cliente: 'Ana Gómez',
    telefono: '2615551111',
    tipoEvento: 'Consulta general',
    estado: 'Confirmada',
    motivoCancelacion: null,
  },
  {
    id: 2,
    fecha: '2026-12-02',
    hora: '11:00',
    cliente: 'Luis Pérez',
    telefono: '2615552222',
    tipoEvento: 'Consulta general',
    estado: 'Cancelada',
    motivoCancelacion: null,
  },
  {
    id: 3,
    fecha: '2027-01-05',
    hora: '12:00',
    cliente: 'Carla Díaz',
    telefono: '2615553333',
    tipoEvento: 'Consulta general',
    estado: 'Pendiente',
    motivoCancelacion: null,
  },
]

const dia = (fecha) => cy.get(`[data-cy="calendar-day"][data-date="${fecha}"]`)

describe('AgendaYA - M05-US1: visualizar calendario mensual', () => {
  beforeEach(() => {
    cy.clock(new Date(2026, 9, 15, 10, 0).getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('agendaya-reservas', JSON.stringify(reservas))
      },
    })
  })

  it('Escenario 1: carga el mes actual con hoy seleccionado e indicadores de reservas', () => {
    cy.get('[data-cy="calendar-title"]').should('exist')
    cy.get('[data-cy="calendar-day"]').should('have.length', 31)
    dia('2026-10-15').should('have.class', 'selected')
    dia('2026-10-14').find('[data-cy="day-indicator"]').should('not.exist')
  })

  it('Escenario 2: navega meses y años y actualiza los indicadores', () => {
    cy.get('[data-cy="calendar-next-month"]').click()

    dia('2026-11-01').should('exist')
    dia('2026-10-01').should('not.exist')
    dia('2026-11-12').find('[data-cy="day-indicator"]').should('exist')

    cy.get('[data-cy="calendar-next-month"]').click()
    dia('2026-12-02').find('[data-cy="day-indicator"]').should('not.exist')

    cy.get('[data-cy="calendar-next-month"]').click()
    dia('2027-01-01').should('exist')
    dia('2027-01-05').find('[data-cy="day-indicator"]').should('exist')

    cy.get('[data-cy="calendar-prev-month"]').click()
    dia('2026-12-01').should('exist')
    dia('2027-01-01').should('not.exist')
  })

  it('Escenario 3: selecciona otro día y quita la selección anterior', () => {
    dia('2026-10-15').should('have.class', 'selected')

    dia('2026-10-16').click()

    dia('2026-10-16').should('have.class', 'selected')
    dia('2026-10-15').should('not.have.class', 'selected')
    cy.screenshot('M05-US1-seleccion-de-dia')
  })
})

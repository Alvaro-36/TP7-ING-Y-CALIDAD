// M05-US09 Escenario 2: al seleccionar un día sin reservas se muestra el mensaje de día vacío.
const reservas = [
  {
    id: 1, fecha: '2026-10-15', hora: '10:00', cliente: 'Luis Pérez', telefono: '2615552222',
    tipoEvento: 'Consulta general', estado: 'Confirmada', motivoCancelacion: null,
  },
]

const dia = (fecha) => cy.get(`[data-cy="calendar-day"][data-date="${fecha}"]`)

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-10-10T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('agendaya-reservas', JSON.stringify(reservas))
      },
    })
  })

  it('muestra el mensaje de día vacío al pasar de un día con reservas a uno sin reservas', () => {
    // Arrange: partir de un día que sí tiene reservas
    dia('2026-10-15').click()
    cy.get('[data-cy="reservation-card"]').should('have.length', 1)
    cy.get('[data-cy="empty-day-message"]').should('not.exist')

    // Act: seleccionar un día sin reservas
    dia('2026-10-16').click()

    // Assert
    cy.get('[data-cy="empty-day-message"]')
      .should('be.visible')
      .and('have.text', 'No hay reservas programadas para este día')
    cy.get('[data-cy="reservation-card"]').should('not.exist')
    cy.get('[data-cy="day-reservations-list"]').should('not.exist')
    cy.get('[data-cy="slot-status"]')
      .should('have.length', 9)
      .each(($slot) => expect($slot).to.have.text('Disponible'))
    dia('2026-10-16').find('[data-cy="day-indicator"]').should('not.exist')
    dia('2026-10-15').find('[data-cy="day-indicator"]').should('exist')
  })
})

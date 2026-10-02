// #6 M05-US2 Escenarios 1 y 2: cancelación exitosa con motivo (Wuilloud)
const CLAVE = 'agendaya-reservas'
const ID = 'r-test-cancelar'
const MOTIVO = 'El cliente avisó que no puede asistir'

const reservaDelTest = {
  id: ID,
  fecha: '2026-10-15',
  hora: '14:00',
  cliente: 'Carla Díaz',
  telefono: '2615553333',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
}

const tarjeta = () => cy.get(`[data-cy="reservation-card"][data-id="${ID}"]`)
const slot1400 = () => cy.get('[data-cy="slot-status"][data-hora="14:00"]')

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(CLAVE, JSON.stringify([reservaDelTest]))
      },
    })
  })

  it('M05-US2: cancela una reserva con motivo y libera el horario', () => {
    // Arrange
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')
    slot1400().should('have.text', 'Reservado')

    // Act
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()
    tarjeta().find('[data-cy="cancel-reservation"]').click()
    cy.get('[data-cy="cancel-reason-input"]').type(MOTIVO)
    cy.get('[data-cy="confirm-cancel"]').click()

    // Assert
    cy.get('[data-cy="cancel-success"]').should('be.visible')
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Cancelada')
    tarjeta().find('[data-cy="cancel-reservation"]').should('not.exist')
    slot1400().should('have.text', 'Disponible')
    cy.window().then((win) => {
      const guardada = JSON.parse(win.localStorage.getItem(CLAVE)).find((r) => r.id === ID)
      expect(guardada.estado).to.equal('Cancelada')
      expect(guardada.motivoCancelacion).to.equal(MOTIVO)
    })
  })
})

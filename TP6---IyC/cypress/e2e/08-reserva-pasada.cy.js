const CLAVE = 'agendaya-reservas'
const ID = 'r-test-pasada'

const reservaPasada = {
  id: ID,
  fecha: '2026-09-09',
  hora: '14:00',
  cliente: 'Ana Torres',
  telefono: '2615558888',
  tipoEvento: 'Consulta general',
  estado: 'Pendiente',
  motivoCancelacion: null,
}

const tarjeta = () => cy.get(`[data-cy="reservation-card"][data-id="${ID}"]`)
const botonCancelar = () => tarjeta().find('[data-cy="cancel-reservation"]')

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-09-10T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(CLAVE, JSON.stringify([reservaPasada]))
      },
    })
  })

  it('M05-US2 Escenario 3: no permite cancelar una reserva pasada', () => {
    // Arrange
    cy.get('[data-cy="calendar-day"][data-date="2026-09-09"]').click()
    tarjeta().should('exist')
    tarjeta().find('[data-cy="reservation-status"]').should('have.text', 'Pendiente')

    // Act
    botonCancelar().then(([boton]) => {
      boton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })

    // Assert
    botonCancelar().should('be.disabled')
    cy.get('[data-cy="cancel-modal"]').should('not.exist')
  })
})

const reservas = [
  {
    id: 1, fecha: '2026-10-15', hora: '10:00', cliente: 'Juan Pérez', telefono: '2615551010',
    tipoEvento: 'Consulta general', estado: 'Confirmada', motivoCancelacion: null,
  },
  {
    id: 2, fecha: '2026-10-15', hora: '11:30', cliente: 'María López', telefono: '2615552020',
    tipoEvento: 'Consulta general', estado: 'Pendiente', motivoCancelacion: null,
  },
  {
    id: 3, fecha: '2026-10-15', hora: '14:00', cliente: 'Carla Díaz', telefono: '2615553030',
    tipoEvento: 'Consulta general', estado: 'Confirmada', motivoCancelacion: null,
  },
  {
    id: 4, fecha: '2026-10-16', hora: '10:00', cliente: 'Otro Paciente', telefono: '2615554040',
    tipoEvento: 'Consulta general', estado: 'Confirmada', motivoCancelacion: null,
  },
]

describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('agendaya-reservas', JSON.stringify(reservas))
      },
    })
  })

  it('muestra las reservas del día ordenadas cronológicamente al seleccionar un día con reservas', () => {
    // Arrange
    // Al congelar la fecha en 15 de octubre de 2026, la aplicación inicia con este día seleccionado.
    // Verificamos el estado inicial antes del click explícito.
    cy.get('[data-cy="selected-day-title"]').should('contain', '2026-10-15')
    cy.get('[data-cy="calendar-day"][data-date="2026-10-16"]').should('exist')
    
    // Act
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').click()

    // Assert
    cy.get('[data-cy="day-reservations-list"]')
      .find('[data-cy="reservation-card"]')
      .should('have.length', 3)
      
    cy.get('[data-cy="empty-day-message"]').should('not.exist')

    // Verificación de tarjetas en orden y sus datos
    cy.get('[data-cy="reservation-card"]').eq(0).within(() => {
      cy.get('[data-cy="reservation-name"]').should('have.text', 'Juan Pérez')
      cy.get('[data-cy="reservation-phone"]').should('not.be.empty').and('have.text', '2615551010')
      cy.get('[data-cy="reservation-time"]').should('not.be.empty').and('have.text', '10:00')
      // No existe un data-cy específico para la etiqueta/tipo de evento en la implementación REAL.
      // Solamente existen name, phone, time, status, cancel según app.js y style.css inspeccionados.
    })

    cy.get('[data-cy="reservation-card"]').eq(1).within(() => {
      cy.get('[data-cy="reservation-name"]').should('have.text', 'María López')
      cy.get('[data-cy="reservation-phone"]').should('not.be.empty').and('have.text', '2615552020')
      cy.get('[data-cy="reservation-time"]').should('not.be.empty').and('have.text', '11:30')
    })

    cy.get('[data-cy="reservation-card"]').eq(2).within(() => {
      cy.get('[data-cy="reservation-name"]').should('have.text', 'Carla Díaz')
      cy.get('[data-cy="reservation-phone"]').should('not.be.empty').and('have.text', '2615553030')
      cy.get('[data-cy="reservation-time"]').should('not.be.empty').and('have.text', '14:00')
    })
    
    // Comprobar que no hay tarjetas vacías buscando elementos de texto vacío
    cy.get('[data-cy="reservation-name"]').each($el => {
      expect($el.text().trim()).to.not.be.empty
    })
  })
})

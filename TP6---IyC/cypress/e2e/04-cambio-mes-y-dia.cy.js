describe('AgendaYA - M05 Gestión de Agenda', () => {
  beforeEach(() => {
    // Congela solo la fecha: "hoy" es 15/10/2026
    cy.clock(new Date('2026-10-15T10:00:00').getTime(), ['Date'])

    // Datos propios del test: no dependen de los datos de prueba del proyecto
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'agendaya-reservas',
          JSON.stringify([
            {
              id: 'r-test-oct', fecha: '2026-10-15', hora: '14:00', cliente: 'Carla Díaz',
              telefono: '2614000001', tipoEvento: 'Consulta', estado: 'Pendiente', motivoCancelacion: null,
            },
            {
              id: 'r-test-nov', fecha: '2026-11-20', hora: '10:00', cliente: 'Martín Ruiz',
              telefono: '2614000002', tipoEvento: 'Consulta', estado: 'Pendiente', motivoCancelacion: null,
            },
          ]),
        )
      },
    })

    // Marca en window: si la página recargara, se perdería
    cy.window().then((win) => {
      win.__sinRecarga = true
    })
  })

  it('cambia de mes y de día sin recargar la página', () => {
    // Arrange: estado inicial
    cy.get('[data-cy="calendar-title"]').should('have.text', 'Octubre 2026')
    cy.get('[data-cy="calendar-day"][data-date="2026-10-15"]').should('have.class', 'selected')
    cy.get('[data-cy="reservation-name"]').should('have.length', 1).and('contain', 'Carla Díaz')

    // Act: mes siguiente y seleccionar el 20/11
    cy.get('[data-cy="calendar-next-month"]').click()
    cy.get('[data-cy="calendar-title"]').should('have.text', 'Noviembre 2026')
    cy.get('[data-cy="calendar-day"][data-date="2026-11-20"]').click()

    // Assert: el día queda seleccionado y muestra solo sus reservas
    cy.get('[data-cy="calendar-day"][data-date="2026-11-20"]').should('have.class', 'selected')
    cy.get('[data-cy="calendar-day"].selected').should('have.length', 1)
    cy.get('[data-cy="selected-day-title"]').should('contain', '2026-11-20')
    cy.get('[data-cy="reservation-card"]').should('have.length', 1)
    cy.get('[data-cy="reservation-name"]').should('contain', 'Martín Ruiz').and('not.contain', 'Carla Díaz')

    // Act: volver al mes anterior
    cy.get('[data-cy="calendar-prev-month"]').click()

    // Assert: vuelve a Octubre y la página nunca se recargó
    cy.get('[data-cy="calendar-title"]').should('have.text', 'Octubre 2026')
    cy.window().its('__sinRecarga').should('eq', true)
  })
})
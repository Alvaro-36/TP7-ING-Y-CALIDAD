// Flujos principales (camino feliz). Cada integrante agrega su escenario en un describe propio.
describe('Agenda - carga inicial', () => {
  it('muestra el mes actual con hoy seleccionado', () => {
    cy.clock(new Date(2026, 9, 10, 10, 0).getTime())
    cy.visit('/')
    cy.get('[data-cy="calendar-title"]').should('have.text', 'Octubre 2026')
    cy.get('[data-cy="calendar-day"].selected').should('have.attr', 'data-date', '2026-10-10')
  })
})

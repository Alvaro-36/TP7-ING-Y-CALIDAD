// Tests unitarios compartidos de src/logica-negocio.js (Jest).
// Cada integrante agrega los tests de sus funciones en tests/<apellido>.test.js.
import { reservasDePrueba } from '../src/logica-negocio.js'

test('los datos de prueba tienen las 7 reservas', () => {
  expect(reservasDePrueba).toHaveLength(7)
})

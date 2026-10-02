# TP6 - IyC · AgendaYA

Módulo **Gestión de Agenda (Admin)**: frontend en HTML/CSS/JS vanilla servido con [Vite](https://vite.dev), tests unitarios con [Jest](https://jestjs.io) y tests E2E con [Cypress](https://www.cypress.io).

## Requisitos

- Node.js 20 o superior (`node -v`)
- npm

## Instalación

```bash
npm install
```

Instala Vite, Jest y Cypress (la primera vez Cypress descarga su binario, tarda unos minutos).

## Levantar el frontend

```bash
npm run dev
```

Abrir <http://localhost:5173>. El puerto es fijo: si está ocupado, el comando falla (cerrar el otro proceso que lo use).

Las reservas se guardan en `localStorage['agendaya-reservas']`. Para volver a los datos de prueba, borrar esa clave desde las DevTools del navegador (Application → Local Storage).

## Tests unitarios

```bash
npm test
```

Corre con Jest todos los `tests/*.test.js` contra `src/logica-negocio.js` (cada integrante tiene su `tests/<apellido>.test.js`). No necesita el frontend levantado.

## Tests E2E (Cypress)

Necesitan el frontend corriendo. Usar **dos terminales**:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run cy:run    # corre todos los specs en modo headless
npm run cy:open   # o abre la interfaz de Cypress para verlos paso a paso
```

Los tests congelan la fecha con `cy.clock(...)` antes de `cy.visit('/')`, porque la app toma el día actual de `new Date()`.

## Estructura

```
frontend/            index.html, app.js (UI) y style.css
src/logica-negocio.js  funciones puras de la agenda (sin DOM)
tests/               tests unitarios (Jest)
cypress/e2e/         flujo-principal.cy.js y flujo-error.cy.js
cypress.config.js    baseUrl http://localhost:5173
```

Todos los elementos testeables tienen un atributo `data-cy` (ver `frontend/app.js`).

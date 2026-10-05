# Cypress después del push a main y rollback exclusivamente con Git

El archivo `.github/workflows/cypress.yml` no utiliza credenciales de Firebase,
servicios externos de despliegue ni tokens personales de GitHub. Utiliza solamente
el `GITHUB_TOKEN` automático que GitHub entrega a cada job.

## Flujo

1. Un push efectivo a `main` inicia el workflow. No tiene trigger de Pull Requests.
2. Se descarga exactamente `github.event.after`, el commit final del push, y se
   instalan las dependencias y Cypress dentro de `TP6---IyC`.
3. Se inicia la aplicación con el script existente `npm run dev`, se espera a que
   responda `http://localhost:5173` y se ejecutan los specs existentes mediante
   la API Node de Cypress. Se conserva `cypress.config.js`, incluida su `baseUrl`.
   Es el mismo motor y configuración utilizados por `npm run cy:run`; la API
   permite distinguir assertions fallidas de fallos al iniciar Cypress.
4. Si todos los tests pasan, termina correctamente y no modifica el repositorio.
5. Si `totalFailed > 0`, el job de tests queda fallido y habilita el de rollback.
   Errores de instalación, servidor, inicio de Cypress o ausencia de tests
   producen un error y requieren revisión; no activan una reversión a ciegas.
6. El rollback descarga el mismo SHA con su historial completo, comprueba que
   `main` sigue apuntando a ese commit y ejecuta `git revert --no-commit`.
   Para un merge utiliza `-m 1`, conservando la línea de main del primer padre.
7. Crea un nuevo commit con `[skip ci]` y `Auto-Rollback-Of: <SHA>`, y lo publica
   con un push normal a main. No hay reset, force push ni reescritura del historial.

Si un push contiene varios commits nuevos, se prueba el estado del último y se
revierte únicamente `github.event.after`, como solicita la estrategia. No se
revierte todo el lote ni se identifica por inferencia un commit intermedio.
Para recuperar un lote entero se requiere una decisión independiente.

## Permisos y configuración necesaria

- El job E2E tiene `contents: read`.
- Solo el job de rollback recibe `contents: write`.
- El token automático se pasa por el entorno al paso de publicación. Se entrega
  a Git mediante un helper temporal, sin guardarlo en la URL del remoto o en
  la configuración del checkout.
- No se deben crear Secrets nuevos ni utilizar `ROLLBACK_GITHUB_TOKEN` de la
  propuesta anterior. El workflow referencia `${{ github.token }}`.
- `main` está protegida en este repositorio. Un administrador debe revisar
  **Settings > Branches / Rules > Rulesets** y comprobar si el actor de Actions
  puede publicar el revert según las reglas aplicables. `contents: write` no
  evita las reglas de PR obligatorio, firmas o checks requeridos.
- No se modifican automáticamente esas reglas ni se cambia a otra credencial.
  Si el token automático no puede cumplir las reglas, este diseño no puede
  publicar el revert automáticamente hasta resolver esa política.
- Mantener los scripts `dev` y la configuración de Cypress de `TP6---IyC` con
  el puerto 5173. Si cambia el puerto, actualizar también la espera del servidor.
- No marcar este workflow exclusivamente posterior al push como requisito
  previo de un PR: no se ejecuta sobre PRs.

## Cómo se evita el bucle

GitHub no inicia un workflow de push cuando ese push fue realizado con el
`GITHUB_TOKEN` del workflow. Además, el mensaje del commit incluye `[skip ci]`.
El job E2E comprueba el marcador `Auto-Rollback-Of:` como defensa adicional,
por ejemplo ante una reejecución manual. Así no se vuelve a revertir el revert.

El workflow original permanece fallido si hubo tests fallidos, aunque el job de
rollback haya terminado correctamente; los logs y artifacts documentan el caso.

## Errores y ejecuciones simultáneas

Cada push puede ejecutar sus tests en un runner independiente. No se usa un
grupo de concurrencia que pueda reemplazar ejecuciones pendientes y omitir
los tests de un push. La comprobación del SHA y el push normal protegen el
historial frente a ejecuciones simultáneas.

Si main avanzó mientras se ejecutaban los tests, el rollback se detiene sin
modificar el remoto. Si avanza entre la comprobación y el push, el push normal
será rechazado sin sobrescribir los nuevos commits. Si falla el revert o la
creación del commit, no se intenta el push. Si el push falla, el mensaje identifica
esa etapa y pide revisar permisos, reglas de main y logs. No hay recuperación
destructiva ni intentos de force push.

## Validación

El archivo pasó actionlint y comprobaciones de sintaxis YAML, JavaScript y Bash.
Se probaron 13 escenarios locales con resultados de Cypress simulados y
repositorios Git temporales: tests exitosos y fallidos, fallos de arranque,
binario ausente, suite vacía/incompleta, revert normal y de merge, main avanzado,
push rechazado, revert conflictivo, commit vacío y SHA incorrecto.
También se ejecutaron los E2E reales contra la aplicación local: 10 tests
pasaron, sin fallos. La comprobación local utilizó Node 26; el workflow utiliza
Node 24 en Ubuntu. No se ejecutó un rollback contra el repositorio real.

## Documentación oficial

- [Cypress Module API](https://docs.cypress.io/app/references/module-api)
- [Eventos producidos por GITHUB_TOKEN y prevención de recursión](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [Omitir workflows mediante skip ci](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
- [Permisos de GITHUB_TOKEN](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)

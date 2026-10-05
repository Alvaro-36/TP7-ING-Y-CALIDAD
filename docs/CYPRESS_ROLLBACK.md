# Cypress despues del push a main y rollback de Firebase Hosting

Copiar el archivo completo `cypress.yml` a `.github/workflows/cypress.yml` en la
raiz de `Alvaro-36/TP7-ING-Y-CALIDAD`. No necesita scripts auxiliares del repositorio.

## Que hace cada seccion

- `on.push.branches: [main]`: inicia el workflow despues de un push efectivo a
  main. No tiene trigger de Pull Requests. Se descarga `github.event.after`,
  el SHA exacto que produjo el evento, y se conserva todo el historial de Git.
- `e2e`: instala las dependencias del proyecto `TP6---IyC` y el binario de
  Cypress, espera el despliegue del mismo SHA y ejecuta los specs existentes
  con `cypress.config.js`. Sobrescribe solamente `baseUrl` para probar el sitio
  de Firebase, en lugar de levantar Vite en localhost.
- `outputs`: diferencia tests fallidos de errores al instalar/iniciar Cypress.
  Solo `totalFailed > 0` permite el rollback. Un fallo de infraestructura deja
  la ejecucion fallida, sin modificar Hosting ni Git.
- `rollback`: comprueba que main no avanzo y que la version previa corresponde
  al padre del commit. Republica esa version ya existente de Firebase Hosting
  mediante su API de historial. No vuelve a compilar el codigo anterior, no
  borra releases ni hace reset de Git.
- `git revert`: se ejecuta solo tras confirmar la restauracion en la API y en
  la URL publicada. Para un merge utiliza `-m 1`; para un commit normal usa
  `git revert` sin mainline. Crea un commit nuevo y hace push normal a main.
- `[skip ci]` y `Auto-Rollback-Of`: el nuevo commit de rollback no reinicia el
  proceso. El marcador tambien permite reconocer un despliegue restaurado
  cuando se prueban cambios posteriores.

Si Cypress pasa, el workflow solo consulta Firebase y guarda evidencias en
GitHub Actions. No publica en Hosting ni crea commits. Si falla y el rollback
termina correctamente, la ejecucion original queda roja porque hubo E2E
fallidos; el job de rollback queda verde y documenta la recuperacion.

## Secrets y variable que espera

Configurar en **Settings > Secrets and variables > Actions**.

| Tipo | Nombre | Valor y uso |
| --- | --- | --- |
| Secret | `FIREBASE_SERVICE_ACCOUNT_PROD` | JSON de una cuenta de servicio del proyecto de produccion. `google-github-actions/auth` genera un token OAuth de lectura para el historial y otro de escritura solo en el job de rollback. |
| Secret | `ROLLBACK_GITHUB_TOKEN` | Token de GitHub con permiso para escribir contenido en este repositorio y un actor autorizado por las reglas de main. Solo se usa para comprobar acceso y autenticar el push del revert. |
| Automatico | `GITHUB_TOKEN` | Token automatico de Actions, con `contents: read`. Se usa para checkout y consultas a GitHub. No requiere crear un Secret manualmente. |
| Variable | `FIREBASE_HOSTING_SITE_ID_PROD` | ID del **sitio Hosting de produccion**, no necesariamente el ID del proyecto. La URL probada es `https://<SITE_ID>.web.app`. Es metadata publica, no una credencial. |

La cuenta de servicio de Firebase necesita `roles/firebasehosting.admin` en el
proyecto correspondiente. Para generar los access tokens con la accion elegida,
necesita ademas `roles/iam.serviceAccountTokenCreator` sobre ella misma. Los scopes
OAuth del job E2E son de solo lectura de Hosting. No se solicita `id-token: write`
porque esta variante usa una clave JSON, no Workload Identity Federation.

Para GitHub, utilizar un PAT con permisos de escritura de contenido y un actor
autorizado a hacer push a main, o adaptar la autenticacion para generar un token
de GitHub App en cada ejecucion. No guardar como credencial permanente un token
de instalacion de App que expire en una hora. Si se revierten cambios dentro de
`.github/workflows`, la credencial puede necesitar tambien permiso de escritura
de workflows. Nunca se utiliza `--force` ni se desactiva la proteccion de main.

**Main esta protegida en este repositorio.** Un administrador debe permitir que
el actor de rollback cumpla o tenga una excepcion limitada a las reglas que
impiden el push automatizado. `contents: write` por si solo no evita una regla de
PR obligatorio. Si GitHub rechaza el push, el workflow informa que Firebase ya
fue restaurado y que el codigo no pudo revertirse/publicarse.

En la consulta realizada al repositorio aparecieron `FIREBASE_TOKEN` y
`FIREBASE_PROJECT_ID_DEV`; no aparecieron los dos Secrets de produccion indicados
arriba. Si las credenciales equivalentes estan guardadas bajo otros nombres,
reemplazar las referencias `secrets.*` del archivo. El `FIREBASE_TOKEN` del CLI
no se puede utilizar directamente como access token OAuth de la API REST.
Esta implementacion no usa automaticamente el proyecto de desarrollo.

## Integracion necesaria con el deploy de produccion

El repositorio consultado no tiene un workflow que despliegue main a produccion.
El workflow de desarrollo se ejecuta solo en develop. Por ello, este archivo
espera un despliegue de produccion realizado por otro workflow/proceso. No hace
ese despliegue: hacerlo aqui incumpliria la condicion de no modificar Firebase
cuando los tests pasan.

Ese despliegue debe identificar el commit en dos lugares:

1. Despues de `npm run build`, crear un archivo publico de identificacion en el
   build, sin secretos:

   ```bash
   node --input-type=commonjs <<'NODE'
   const fs = require('node:fs');
   fs.writeFileSync('TP6---IyC/frontend/dist/__deployment.json',
     JSON.stringify({ sha: process.env.GITHUB_SHA }));
   NODE
   ```

   Ejecutar este paso desde la raiz del repositorio. La compilacion sigue siendo
   `npm run build` dentro de `TP6---IyC`.

2. Agregar el mensaje del SHA al comando de publicacion de **produccion**:

   ```bash
   npx -y firebase-tools@latest deploy --only hosting \
     --project "$FIREBASE_PROJECT_ID_PROD" \
     --message "github-sha:$GITHUB_SHA" --non-interactive
   ```

   `FIREBASE_PROJECT_ID_PROD` debe proceder de la configuracion del workflow de
   produccion. La autenticacion de ese deploy puede conservar `FIREBASE_TOKEN`
   en su entorno, o utilizar ADC. Ninguna credencial se escribe en el marcador.
   El destino configurado en `firebase.json` debe ser el mismo sitio de
   `FIREBASE_HOSTING_SITE_ID_PROD`.

3. Agregar a `hosting.headers` en `firebase.json`, conservando los headers que
   ya existan:

   ```json
   {
     "source": "/__deployment.json",
     "headers": [{ "key": "Cache-Control", "value": "no-store" }]
   }
   ```

4. El **job que publica produccion** debe usar el mismo bloqueo que el rollback:

   ```yaml
   concurrency:
     group: firebase-production-main
     cancel-in-progress: false
   ```

   No usar ese grupo para el job E2E que espera la publicacion: podria bloquear
   precisamente el deploy que esta esperando. El bloqueo coordina workflows del
   mismo repositorio. Las publicaciones manuales u otros repositorios deben
   coordinarse aparte. El workflow vuelve a comprobar la release activa antes
   de restaurar para no sobrescribir una version mas nueva.

5. Conservar al menos **dos versiones de Hosting**. Tanto el despliegue probado
   como su predecesor deben contener el marcador y el mensaje indicados. Preparar
   primero una publicacion base identificada de esta manera; una release
   antigua sin identificacion no permite asociar con seguridad Hosting y Git.

El tiempo de espera de la publicacion es 20 minutos. Se puede ajustar junto con
`timeout-minutes` si el deploy de produccion requiere mas tiempo.

## Casos en los que se detiene

- No aparece la publicacion del SHA o el archivo servido no coincide: no inicia
  Cypress sobre una version distinta y no hace rollback.
- No existe un predecesor retenido, su version fue eliminada o no corresponde al
  padre del commit: no cambia Firebase ni hace revert.
- Push inicial, forzado o con varios commits nuevos: si los E2E fallan, se
  detiene antes de modificar Firebase. Revertir solo el ultimo commit no
  restauraria todo el codigo correspondiente a la version previa al push.
  Los merges normales con un unico commit sobre la primera linea de padres
  estan contemplados.
- Main o Hosting avanzaron: no revierte un estado antiguo ni sobrescribe los
  cambios nuevos. Un avance de main posterior a restaurar Firebase se informa
  explicitamente como recuperacion incompleta.
- La API rechaza la restauracion o no se puede confirmar lo que sirve el sitio:
  no ejecuta `git revert`. Si se pierde la respuesta del POST, consulta la release
  activa para comprobar si la operacion termino, sin repetirla a ciegas.
- Conflicto del revert o rechazo del push: informa que Firebase ya fue restaurado
  y que falta recuperar el codigo. No fuerza un push ni borra historial.

La restauracion cubre **Firebase Hosting**: archivos y configuracion de esa
version. No restaura documentos de Firestore, usuarios de Auth ni datos de
Realtime Database. Los E2E actuales del proyecto usan fixtures en el
localStorage del navegador de Cypress.

## Validacion realizada

El archivo paso actionlint y las comprobaciones de sintaxis de YAML, JavaScript
y Bash. Se verificaron 22 escenarios con API simulada y repositorios Git
temporales: historial paginado, precision temporal, publicaciones ajenas,
version eliminada, fallos de autenticacion, respuesta de rollback perdida,
idempotencia, clasificacion de resultados Cypress, revert normal y de merge,
main avanzado y push rechazado. No se ejecuto un rollback en Firebase real.

## Documentacion oficial

- [API de historial de releases](https://firebase.google.com/docs/reference/hosting/rest/v1beta1/sites.releases/list)
- [Publicar una version existente](https://firebase.google.com/docs/reference/hosting/rest/v1beta1/sites.releases/create)
- [Gestion y retencion de versiones de Hosting](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Autenticacion de Google desde Actions](https://github.com/google-github-actions/auth)
- [Cypress Module API y tipos de errores](https://docs.cypress.io/app/references/module-api)
- [Omitir workflows mediante skip ci](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
- [GitHub: alias YAML soportados](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations#yaml-anchors-and-aliases)

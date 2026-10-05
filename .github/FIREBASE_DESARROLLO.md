# Despliegue automatico de desarrollo

El workflow `Firebase Hosting - Desarrollo` implementa el punto 9 del nivel
avanzado del TP7 para la aplicacion `TP6---IyC`.

## Funcionamiento

1. Todo PR hacia `develop` ejecuta instalacion reproducible (`npm ci`), tests
   unitarios, linter, verificacion de formato y build en pasos separados.
2. Al integrar el PR, GitHub genera un evento `push` sobre `develop`. Se repiten
   las verificaciones sobre el codigo integrado y se guarda el build como artefacto.
3. Solo si todas las verificaciones pasan, se publica ese mismo artefacto en
   Firebase Hosting mediante la credencial guardada en GitHub Secrets.
4. La ejecucion y la URL quedan registradas en Actions y en el Environment
   `development`. Los PR no acceden a las credenciales de Firebase.

El evento `push` tambien cubre pushes directos a `develop`. La proteccion de rama
debe exigir PR si el equipo quiere que todos los cambios se integren por merge.
Este workflow no se dispara desde `main`.

## Configuracion necesaria antes de integrar

Un integrante con acceso a Secrets debe configurar estos **Repository secrets** en
Settings > Secrets and variables > Actions > New repository secret:

| Nombre | Valor |
| --- | --- |
| `FIREBASE_PROJECT_ID_DEV` | ID del proyecto Firebase dedicado al ambiente de desarrollo. |
| `FIREBASE_TOKEN` | Token de Firebase con permiso para desplegar Hosting en el proyecto de desarrollo. Ya existe en el repositorio. |

Usar un proyecto Firebase separado del de produccion. `deploy --only hosting` publica
en el sitio estable **del proyecto de desarrollo**, con URL
`https://<FIREBASE_PROJECT_ID_DEV>.web.app`. No es un canal temporal que expire.
El workflow no depende de un proyecto por defecto en `.firebaserc`.

El token debe pertenecer a una cuenta con permisos de despliegue en el proyecto.
Hosting debe estar habilitado y tener su sitio predeterminado creado. GitHub no
permite leer el valor de un Secret ya guardado: su validez se comprueba cuando
corre el despliegue. Nunca incluir tokens en commits ni en capturas.

Este workflow aprovecha el `FIREBASE_TOKEN` existente. Firebase lo sigue
soportando como autenticacion heredada; para una futura migracion recomienda
Application Default Credentials con una cuenta de servicio. Esa migracion
requiere acceso al proyecto para generar y configurar la nueva credencial.

Si se preconfigura el Environment `development`, permitir despliegues desde
`develop` y dejarlo sin revisores requeridos para que sea automatico. Los secrets
tambien pueden guardarse en ese Environment en lugar de a nivel repositorio.

El job de despliegue verifica que ambos secrets existan y que el ID tenga un
formato valido; los errores no imprimen la credencial. La autenticacion se pasa
por una variable de entorno, sin incluir el token como argumento del comando.

## Verificacion de la entrega

1. Abrir un PR hacia `develop` y comprobar `Validar y compilar desarrollo` en verde.
   `Desplegar a desarrollo` debe quedar omitido mientras el PR este abierto.
2. Configurar los dos secrets y hacer merge del PR.
3. En Actions, comprobar que la ejecucion de `Firebase Hosting - Desarrollo`
   corresponde al commit integrado y que ambos jobs terminaron correctamente.
4. Abrir la URL del despliegue y verificar que carga AgendaYA.
5. Guardar para el informe el enlace y las capturas de Actions, con los pasos de
   calidad y el despliegue visibles, sin mostrar valores de secrets.

Si falla un check, `needs: build` impide el despliegue. Si faltan secrets, se
muestra un error que identifica sus nombres. Corregir la configuracion y usar
Re-run failed jobs en Actions para reintentar el despliegue del mismo commit.

## Referencias oficiales

- [Firebase Hosting con GitHub Actions](https://firebase.google.com/docs/hosting/github-integration)
- [Autenticacion del CLI en CI](https://firebase.google.com/docs/cli#cli-ci-systems)
- [GitHub Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

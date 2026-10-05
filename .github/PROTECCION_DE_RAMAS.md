# Protección de ramas `main` y `develop`

Así solo se puede mergear un PR de hotfix si los jobs `quality` y `regression-proof`
del workflow [hotfix-ci.yml](workflows/hotfix-ci.yml) pasaron.

## 0. Requisitos previos

1. Crear la rama `develop` si todavía no existe:
   ```bash
   git checkout main && git pull
   git checkout -b develop
   git push -u origin develop
   ```
2. Mergear en `main` y en `develop` la configuración de calidad (`hotfix-ci.yml`,
   `vitest.config.js`, `vitest.jest-shim.js`, `eslint.config.js`, `.prettierrc.json` y el
   `package.json`/`package-lock.json` actualizados). `regression-proof` corre Vitest
   **sobre la rama destino**, así que esa rama tiene que tener Vitest instalado.
3. Ejecutar el workflow al menos una vez (abrir un PR de prueba desde una rama
   `hotfix/INC-0000-prueba`). GitHub solo muestra un check para elegirlo como
   obligatorio si se ejecutó en el repo en los últimos 7 días.
4. Si el repo es **privado** y la cuenta es GitHub Free, la protección de ramas no
   se aplica: el repo tiene que ser público o la cuenta tiene que tener plan Pro/Team.

## 1. Regla para `main` (UI, protección clásica)

1. En GitHub: **Settings** → **Branches** → **Add classic branch protection rule**.
2. **Branch name pattern**: `main`.
3. Activar **Require a pull request before merging**.
   - (Recomendado) **Require approvals**: 1.
   - (Recomendado) **Dismiss stale pull request approvals when new commits are pushed**.
4. Activar **Require status checks to pass before merging**.
   - Activar **Require branches to be up to date before merging**.
   - En el buscador escribir y agregar `quality` y `regression-proof`
     (aparecen como checks de *GitHub Actions*).
5. Activar **Do not allow bypassing the above settings** (es la opción que antes se
   llamaba *Include administrators*: aplica las reglas también a admins).
6. Dejar **desactivados** *Allow force pushes* y *Allow deletions*.
7. (Solo repos de organización) Activar **Restrict who can push to matching branches**
   sin agregar a nadie.
8. **Create** / **Save changes**.

Con *Require a pull request* + *Do not allow bypassing*, cualquier `git push` directo a
`main` (incluso de un admin) se rechaza con `protected branch hook declined`.

## 2. Regla para `develop`

Repetir el paso 1 con **Branch name pattern** = `develop`.

## Alternativa: un solo ruleset para las dos ramas

1. **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
2. **Ruleset name**: `hotfix-protection`. **Enforcement status**: `Active`.
3. **Bypass list**: dejarla **vacía** (así aplica también a administradores).
4. **Target branches** → **Add target** → **Include by pattern**: `main` y `develop`.
5. Activar:
   - **Restrict deletions**
   - **Require a pull request before merging** (approvals: 1)
   - **Require status checks to pass** → **Add checks** → `quality` y `regression-proof`
     (y activar *Require branches to be up to date before merging*)
   - **Block force pushes**
6. **Create**.

## Alternativa: por CLI (`gh`)

```bash
for BRANCH in main develop; do
  gh api -X PUT "repos/Alvaro-36/TP7-ING-Y-CALIDAD/branches/$BRANCH/protection" \
    -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [{ "context": "quality" }, { "context": "regression-proof" }]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "dismiss_stale_reviews": true },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
done
```

## Verificación

1. `git push origin main` desde local → tiene que ser rechazado.
2. PR desde `hotfix/INC-0001-x` **sin** test → `regression-proof` falla y el botón
   *Merge* queda bloqueado.
3. PR con un test que falla en la base y pasa con el fix → ambos checks en verde y
   se habilita el merge.

> **Nota:** si un job se omite por su `if` (rama que no empieza con `hotfix/INC`),
> GitHub lo informa como *Skipped*, y un check obligatorio omitido **no bloquea** el
> merge. Es lo esperado: este workflow solo controla los hotfixes. Los PRs de otras
> ramas (features, releases) necesitan su propio workflow si también se quiere
> exigirles checks.

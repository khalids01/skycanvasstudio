# GitHub → Docker Hub → Dokploy Compose

This follows `ts-starter`'s ecommerce deployment layout. GitHub Actions builds and tests **two images** in `khalids01/skycanvasstudio`. Dokploy runs **three containers**: `web`, `api`, and a one-shot `migrate` service. PostgreSQL and Redis are provisioned separately in Dokploy and reached through internal connection URLs on `dokploy-network`.

The migration service uses the **same API release image** as the API, runs `prisma migrate deploy`, then exits. It has `restart: "no"`. Both web and API depend on `service_completed_successfully`: a failed migration prevents the new app containers from starting. Use regular Docker Compose, not Swarm Stack. The migrated container remaining **Exited (0)** is expected.

## 1. GitHub Actions settings

In repository **Settings → Secrets and variables → Actions**, add:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `DOCKERHUB_TOKEN` | Docker Hub read/write publishing token for `khalids01` |
| Secret | `DOKPLOY_API_KEY` | Dokploy profile API token with access to the Compose service |
| Variable | `VITE_SERVER_URL` | Public HTTPS API origin, e.g. `https://api.example.com`; required |
| Variable | `DOKPLOY_URL` | HTTPS Dokploy dashboard origin, without `/api` or other paths |
| Variable | `DOKPLOY_COMPOSE_ID` | ID of this Dokploy Compose service |
| Variable | `VITE_ENABLE_POLAR` | `false` initially |
| Variable | `VITE_OWNER_SETUP_CHECK` | `false` initially |
| Variable | `AUTH_SESSION_COOKIE_NAME` | `skycanvasstudio.session_token` by default; match runtime |

[Secrets](https://github.com/khalids01/skycanvasstudio/settings/secrets/actions) · [Variables](https://github.com/khalids01/skycanvasstudio/settings/variables/actions)

The GitHub Actions workflow is `.github/workflows/docker-publish.yml` (**Publish Docker images and deploy**). Pushes and manual runs on `main` generate:

```text
khalids01/skycanvasstudio:api-sha-<full-commit>
khalids01/skycanvasstudio:web-sha-<full-commit>
```

Only after the full stack check succeeds are these pushed. Only after both commit images are published are moving tags `api-main` and `web-main` updated. Deployment calls `/api/compose.deploy` after publication succeeds. Failed builds, migrations, checks, or publication do not trigger deployment. The Actions run validates the stack against disposable test databases, never your production URLs.

The target architecture is `linux/amd64`. Both images use Bun 1.4.3 and preserve workspace dependencies/source because the runtime imports workspace packages. API builds generate the Prisma client and build the API; builds do not connect to production databases or run migrations. The API image also contains the Prisma CLI needed by the migration service.

## 2. Provision PostgreSQL and Redis in Dokploy

Create dedicated PostgreSQL and Redis services for SkyCanvas Studio, with durable storage and backups. Attach them to the external `dokploy-network` used by this Compose stack. Start them before deploying the stack.

Use their **internal DNS names** and credentials in `DATABASE_URL` and `REDIS_URL`; `localhost` in an app container refers to the app itself. URL-encode special characters in usernames/passwords. Do not expose database ports publicly. The migration container requires only `DATABASE_URL` and `NODE_ENV`; it does not need OAuth, Redis, SMTP, or billing credentials.

## 3. Configure the Compose service

1. Create a **Docker Compose** service named **skycanvasstudio** in your existing Dokploy project/environment.
2. Connect `khalids01/skycanvasstudio`, branch **main**, Compose path **`./docker-compose.production.yml`**. Alternatively, paste that file into the raw Compose editor.
3. If the Docker Hub repository is private, configure registry pull credentials in Dokploy (registry `docker.io`). GitHub's publishing token is separate from Dokploy's registry login.
4. Copy [`.env.production.example`](../.env.production.example) into this Compose service's **Environment settings**, replacing all example domains, service names, and credential placeholders. Dokploy must write these values into the service's generated `.env`, which is passed only to the API via `env_file`.
5. Set **`IMAGE_TAG=main`** for automatic updates, or `IMAGE_TAG=sha-<full-published-commit>` for a pinned release. Both API and web must use the same release tag.
6. Add the public website domain to Compose service **`web`**, container port **`3001`**, and the API domain to service **`api`**, container port **`3000`**. Configure DNS and HTTPS for both. `migrate` gets no domain or port.
7. Copy the Compose service's ID into GitHub variable `DOKPLOY_COMPOSE_ID`, set the dashboard URL and API key, and leave Git-source push auto-deploy / Docker Hub webhooks disabled. Actions deploys after image publication to avoid races.

The original web-only image tags (`latest` / `sha-*`) are superseded by `web-*` and `api-*`. Replace the previous Compose definition rather than reusing the web-only image for the API or migrator.

## 4. Environment variables: what goes where

### API runtime: Dokploy only

Required: `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET` (generate with `openssl rand -hex 32`), `BETTER_AUTH_URL` (the public API origin), and `CORS_ORIGIN` (the public website origin). Use a dedicated `REDIS_KEY_PREFIX=skycanvasstudio:`.

The retained starter currently requires **all three OAuth provider pairs** at startup: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`. Supply real configuration for sign-in providers you enable. GitHub login uses an OAuth app client ID/secret, not a GitHub personal access token. Provider callback URLs are:

```text
https://YOUR_API_DOMAIN/api/auth/callback/github
https://YOUR_API_DOMAIN/api/auth/callback/google
https://YOUR_API_DOMAIN/api/auth/callback/discord
```

Use the same `AUTH_SESSION_COOKIE_NAME` in web build configuration and API runtime. For sibling web/API subdomains, set `AUTH_COOKIE_DOMAIN` to their shared parent (e.g. `.example.com`) so SSR can receive the session cookie; HTTPS is required for production auth cookies.

Configure `SMTP_HOST`, `SMTP_PORT`, `EMAIL`, `EMAIL_PASSWORD`, and `EMAIL_FROM` for verification, password reset, magic links, and invitations. API startup does not require SMTP, but those email flows require a working mail provider.

Keep `ENABLE_POLAR=false` and `OWNER_SETUP_CHECK=false` initially. Only enable billing after configuring the Polar credentials/product IDs and matching public flag. Do not pass database, Redis, OAuth, SMTP, auth secrets, or deployment tokens as Docker build arguments or browser variables.

### Web: public build configuration and limited runtime settings

`VITE_SERVER_URL` must be the **public API origin** reachable by browsers and the web SSR server. Use the same value in GitHub Actions variables and Dokploy Environment settings. Configure DNS and HTTPS routing so the web container can reach it. Never set the public browser API URL to an internal Docker name such as `http://api:3000`.

`VITE_*` values are embedded in browser assets at build time. Changing Dokploy env alone does not update the browser bundle; change the GitHub variable and publish a fresh release. `VITE_ENABLE_POLAR`, `VITE_OWNER_SETUP_CHECK`, and `AUTH_SESSION_COOKIE_NAME` are public settings too. The Compose file explicitly maps the web settings without passing API secrets to the web process. Defaults: web port `3001`, API port `3000`.

### Migrate

Only `DATABASE_URL` and `NODE_ENV=production` are provided. It runs `bun --bun run --cwd packages/db db:migrate:deploy`, applies pending checked-in migrations, and stops with exit code 0. It never runs `migrate dev`, resets the database, creates an owner, or seeds users. On an existing database, confirm the target and a restorable backup before deployment; an existing schema without matching Prisma migration history requires a reviewed baseline.

## 5. First deployment and owner setup

1. Finish the GitHub settings, databases, Compose environment, registry access, and domain configuration above.
2. Run **Actions → Publish Docker images and deploy → Run workflow**, selecting `main`.
3. Confirm both images publish and Dokploy accepts the deployment. In Dokploy, confirm `migrate` finishes as **Exited (0)** and `api` / `web` become healthy. API acceptance queues deployment; inspect the deployment logs and website to verify completion.
4. Check `https://YOUR_API_DOMAIN/health/ready` (tests PostgreSQL and Redis), `/health/live` (process liveness), and `https://YOUR_WEB_DOMAIN/healthz`.
5. Provision RBAC and your owner **explicitly**, using the API image and the service's runtime environment. From the deployment checkout with its generated `.env`:

```sh
docker compose -f docker-compose.production.yml run --rm --no-deps api bun run --cwd packages/db prisma/seed/rbac.ts
docker compose -f docker-compose.production.yml run --rm --no-deps api bun run --cwd packages/db scripts/make-owner.ts --email owner@example.com --name Owner
```

Replace the owner email/name. These are explicit setup steps, not automatic migration side effects. Subsequent pushes to `main` publish and deploy automatically when `IMAGE_TAG=main`.

## 6. Local verification

```sh
docker build -f docker/api.Dockerfile -t khalids01/skycanvasstudio:api-check .
docker build -f docker/web.Dockerfile --build-arg VITE_SERVER_URL=https://api.example.test -t khalids01/skycanvasstudio:web-check .
bash scripts/smoke-stack.sh
python3 -m unittest discover -s scripts -p 'test_*.py'
```

The smoke script uses `docker-compose.smoke.yml` to create isolated test PostgreSQL/Redis, executes migrations on a fresh database, verifies that the migration container exits successfully with no restart policy, reruns migrations to check idempotence, then checks API readiness/session responses and web pages/assets. It also simulates a failed migration and verifies both apps remain stopped. It removes all its containers, network, and volumes on success or failure. No production database is accessed, and no test server is left running.

## Rollback

Set `IMAGE_TAG=sha-<previous-published-commit>` in Dokploy and redeploy. The API, web, and migration container then use the same selected release. Application rollback does not reverse database migrations; schema compatibility or a reviewed database recovery may be required. Restore `IMAGE_TAG=main` to resume automatic updates.

References: [ecommerce deployment setup](https://github.com/khalids01/ts-starter/blob/ecommerce/deploy.readme.md), [Compose startup dependencies](https://docs.docker.com/compose/how-tos/startup-order/), [Prisma production migrations](https://docs.prisma.io/docs/cli/migrate/deploy), [Dokploy deployment](https://docs.dokploy.com/docs/core/auto-deploy).

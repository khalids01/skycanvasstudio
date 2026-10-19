# SkyCanvas Studio

One home for the SkyCanvas Studio software collection, starting with DiskVacuum and Job Agent. Built from the `main` branch of [ts-starter](https://github.com/khalids01/ts-starter) at `b8a36f6`.

## Run the public site

```sh
bun install --frozen-lockfile
bun run dev:web
```

Open http://localhost:3001. The homepage and product pages work without a database, auth server, or API keys.

```sh
bun run --cwd apps/web build
bun run --cwd apps/web serve
```

The web build generates client assets and the TanStack Start server in `apps/web/dist`. The repository includes production API/web Dockerfiles and a GitHub Actions workflow for Docker Hub and Dokploy. See [deployment setup](docs/deployment.md) for the required Dokploy Compose service, repository variables, and secrets.

## Appearance

Dark mode is the default, regardless of the operating system theme. The header includes a light/dark toggle on desktop and mobile; the existing theme provider saves the visitor’s selection in local storage.

## Product catalog

- `/` — shared company landing page, software catalog, studio philosophy, and FAQs.
- `/products/disk-vacuum` — features, privacy, platform status, release links, and support.
- `/products/job-agent` — features, development status, data use, source, and support.

Product copy, release URLs, and availability live in `apps/web/src/features/studio/products.ts`. Add a catalog entry there to create another product page and include it in the shared product grid and footer. The two current preview illustrations are implemented in `ProductPreview` in `studio.tsx`; add a preview when adding another product. Preview windows use illustrative sample data rather than actual screenshots.

Shared components and styles live in `apps/web/src/features/studio/`. Product details use the typed dynamic route `apps/web/src/routes/_public/products/$slug.tsx`.

## Backend and deployment

The deployment includes the starter's API, auth, admin, and billing modules alongside the web app. Billing is disabled by default. `docker-compose.production.yml` runs `web` (3001), `api` (3000), and a one-shot `migrate` container that must succeed before either app starts. Provision PostgreSQL and Redis separately in Dokploy, as in ts-starter's ecommerce deployment.

GitHub Actions publishes matching `web-*` and `api-*` images in `khalids01/skycanvasstudio`, then triggers Dokploy Compose deployment. See [deployment setup](docs/deployment.md) and [.env.production.example](.env.production.example) for build variables, runtime credentials, domains, migration behavior, and explicit owner/RBAC setup.

Public marketing pages still work without an API in local development. Accounts/admin routes require the configured backend. The inherited workspace has existing TypeScript errors in backend modules; production builds and the full stack smoke checks are the deployment checks.

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

The web build generates client assets and the TanStack Start server in `apps/web/dist`. Deploy using a host that supports TanStack Start; the public site has not been deployed as part of this repository setup.

## Appearance

Dark mode is the default, regardless of the operating system theme. The header includes a light/dark toggle on desktop and mobile; the existing theme provider saves the visitor’s selection in local storage.

## Product catalog

- `/` — shared company landing page, software catalog, studio philosophy, and FAQs.
- `/products/disk-vacuum` — features, privacy, platform status, release links, and support.
- `/products/job-agent` — features, development status, data use, source, and support.

Product copy, release URLs, and availability live in `apps/web/src/features/studio/products.ts`. Add a catalog entry there to create another product page and include it in the shared product grid and footer. The two current preview illustrations are implemented in `ProductPreview` in `studio.tsx`; add a preview when adding another product. Preview windows use illustrative sample data rather than actual screenshots.

Shared components and styles live in `apps/web/src/features/studio/`. Product details use the typed dynamic route `apps/web/src/routes/_public/products/$slug.tsx`.

## Future accounts and monetization

The starter's auth, admin, server, database, and billing modules are retained for later work. They are not required by the marketing pages. Public pages skip session requests and visitor tracking. Polar is disabled by default; enable it explicitly with `VITE_ENABLE_POLAR=true` once billing is configured. No paid plans or shared product subscriptions are currently offered by this site.

`VITE_SERVER_URL` defaults to `http://localhost:3000` for the retained application features. Set it to your API origin when configuring them; server features also require their own environment and infrastructure. The inherited workspace has existing TypeScript errors in backend modules; the public web production build succeeds independently.

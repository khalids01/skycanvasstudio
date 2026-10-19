# Docker Hub → Dokploy deployment

Every push to `main` (or a manual run on `main`) builds and smoke-tests the production image, publishes `khalids01/skycanvasstudio:latest` and `khalids01/skycanvasstudio:sha-<full-commit>`, then requests a Dokploy Compose deployment. Publication and deployment are serialized. A failed build or smoke check never publishes; a failed publication never triggers deployment.

The image serves the public TanStack Start site using Bun on port **3000**, including SSR and static assets. It runs as an unprivileged user and exposes `/healthz`. It does not start the retained backend, database, or Redis. The workflow currently targets **linux/amd64**; use an x86-64 Dokploy server.

## 1. Docker Hub

1. Sign in as `khalids01` and create the repository **skycanvasstudio** if it does not exist.
2. Public visibility permits Dokploy to pull without registry credentials. If private, configure Docker Hub pull credentials in the Dokploy Compose service as well.
3. Create a Docker Hub personal access token with read/write repository permission for CI. Use a token rather than your account password.
4. Add it as the `DOCKERHUB_TOKEN` GitHub Actions repository secret.

Docker Hub login is fixed to `khalids01`; the image name is fixed to `khalids01/skycanvasstudio` in the workflow.

## 2. Dokploy Compose service

Use your existing Dokploy instance. This follows the ecommerce and job-scraper publish-then-deploy pattern, using `/api/compose.deploy` with a `composeId`. Configure the dashboard with HTTPS before adding its API credentials to Actions.

In Dokploy:

1. Create a project named **SkyCanvas Studio** and a **Docker Compose** service named **skycanvasstudio** inside its production environment.
2. Select the raw Compose editor and paste the contents of [`docker-compose.production.yml`](../docker-compose.production.yml). This configuration pulls `khalids01/skycanvasstudio:latest` on deployment; it does not build on the VPS.
3. For a private Docker Hub repository, configure Docker Hub registry credentials with pull permission in Dokploy.
4. Configure your website domain for Compose service **web**, container port **3000**, and HTTPS. Create the domain's DNS records pointing to the Dokploy server. The Compose file exposes the internal port without publishing a host port.
5. No database or API keys are required for the public site. `PORT=3000` and `HOST=0.0.0.0` are already set in the Compose file.
6. Copy the service's **composeId** from its dashboard URL or retrieve it through `GET /api/project.all`. Use that value for `DOKPLOY_COMPOSE_ID`.
7. Create a Dokploy API token in profile settings with access to this Compose service.
8. Leave source auto-deploy and Docker Hub webhooks unconfigured for this service; the Actions API call triggers deployment after publication succeeds.

## 3. GitHub Actions configuration

Open **Settings → Secrets and variables → Actions** in the repository and create these settings:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `DOCKERHUB_TOKEN` | Docker Hub read/write access token belonging to `khalids01` |
| Variable | `DOKPLOY_URL` | HTTPS dashboard origin, e.g. `https://deploy.example.com`, without `/api` or other paths |
| Secret | `DOKPLOY_API_KEY` | Dokploy profile API token |
| Variable | `DOKPLOY_COMPOSE_ID` | ID of the Docker Compose service configured above |

Do not commit credentials or paste them into source files. The deployment script refuses redirects so the API key is not forwarded to another URL. Missing credentials fail the affected job with setup instructions. Docker publication can succeed while the deploy job fails until Dokploy is configured. The workflow reports missing Dokploy configuration as a failure rather than claiming deployment succeeded.

[Add secrets](https://github.com/khalids01/skycanvasstudio/settings/secrets/actions) · [Add variables](https://github.com/khalids01/skycanvasstudio/settings/variables/actions).

## 4. First deployment

1. Complete the settings above.
2. Go to **Actions → Publish Docker image and deploy → Run workflow**, selecting `main`.
3. Confirm the `publish` job passes and Docker Hub contains `latest` and the commit tag.
4. Confirm the `deploy` job passes, then inspect Dokploy's deployment logs and your website's `/healthz` endpoint. API acceptance queues a deployment; it does not by itself prove the website is live.
5. Subsequent pushes to `main` repeat this automatically.

## Local verification

```sh
docker build -t skycanvasstudio:check .
bash scripts/smoke-container.sh skycanvasstudio:check
python3 -m unittest discover -s scripts -p 'test_*.py'
```

The smoke check starts a container on a random loopback port, checks the homepage, both product routes, health, CSS, favicon, and missing routes, then removes the container on success or failure. It leaves no server running.

For a manual local preview:

```sh
docker run --rm -p 127.0.0.1:3000:3000 skycanvasstudio:check
```

Stop it with Ctrl+C. Outside Docker, build with `bun run --cwd apps/web build`, then run `bun run --cwd apps/web start`.

## Rollback and future backend work

For rollback, change the `web.image` value in Dokploy's Compose editor to `khalids01/skycanvasstudio:sha-<full-commit>` and deploy it. Set it back to `khalids01/skycanvasstudio:latest` to resume automatic updates; the workflow deploys the image configured in the Dokploy Compose file and does not rewrite that setting.

`VITE_*` values are embedded at build time. The public site does not need a backend; the Dockerfile disables Polar and owner setup checks. If the retained application features are enabled later, configure a real API origin through the Docker build argument `VITE_SERVER_URL` and add the corresponding Actions build argument before publishing. Restarting a container with a different Vite environment variable does not rebuild browser assets.

References: [Dokploy API deployment](https://docs.dokploy.com/docs/core/auto-deploy), [Docker Hub repository creation](https://docs.docker.com/docker-hub/repos/create/), [Docker access tokens](https://docs.docker.com/security/access-tokens/), [Bun production hosting for TanStack Start](https://bun.sh/guides/ecosystem/tanstack-start).

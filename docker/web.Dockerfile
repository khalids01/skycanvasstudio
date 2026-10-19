# syntax=docker/dockerfile:1
FROM oven/bun:1.4.3 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile --linker hoisted
ARG VITE_SERVER_URL
ARG VITE_ENABLE_POLAR=false
ARG VITE_OWNER_SETUP_CHECK=false
ARG AUTH_SESSION_COOKIE_NAME=skycanvasstudio.session_token
RUN test -n "$VITE_SERVER_URL"
ENV VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_ENABLE_POLAR=$VITE_ENABLE_POLAR \
    VITE_OWNER_SETUP_CHECK=$VITE_OWNER_SETUP_CHECK \
    AUTH_SESSION_COOKIE_NAME=$AUTH_SESSION_COOKIE_NAME
RUN bun --bun run --cwd apps/web build

FROM oven/bun:1.4.3-slim AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
USER bun
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e 'const r = await fetch(`http://127.0.0.1:${process.env.PORT || 3001}/healthz`); if (!r.ok) process.exit(1)'
CMD ["bun", "run", "--cwd", "apps/web", "start"]

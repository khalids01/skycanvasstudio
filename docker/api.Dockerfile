# syntax=docker/dockerfile:1
FROM oven/bun:1.4.3 AS build
WORKDIR /app
COPY . .
# Workspace source is loaded at runtime; expose its dependencies at the root.
RUN bun install --frozen-lockfile --linker hoisted
# Generation parses config but never connects to a database or runs migrations.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build bun --bun run --cwd packages/db db:generate
RUN bun --bun run --cwd apps/server build

FROM oven/bun:1.4.3-slim AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD bun -e 'const r = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/health/ready`); if (!r.ok) process.exit(1)'
CMD ["bun", "run", "--cwd", "apps/server", "start"]

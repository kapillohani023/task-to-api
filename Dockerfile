# syntax=docker/dockerfile:1
# Next.js 16 + Prisma + bun. Copy this file to the repo root.
# `next start` (not standalone) so Prisma keeps working without a next.config change.

FROM oven/bun:1-debian AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile \
  && bunx prisma generate

FROM oven/bun:1-debian AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* is inlined at build time.
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN bunx prisma generate && bun run build

FROM oven/bun:1-debian AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && (getent group nodejs >/dev/null || groupadd --system nodejs) \
  && (id -u nextjs >/dev/null 2>&1 || useradd --system --gid nodejs --create-home nextjs)

COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/bun.lock ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/privacy >/dev/null || exit 1
ENTRYPOINT ["/app/docker-entrypoint.sh"]

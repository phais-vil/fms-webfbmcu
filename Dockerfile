# syntax=docker/dockerfile:1

# ═══ Stage 1: Dependencies ═══
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json .npmrc* ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# ═══ Stage 2: Builder ═══
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client, build Standalone Next.js & bundle bootstrap script
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
ENV AUTH_SECRET="build-time-dummy-secret-placeholder-32b"
ENV APP_URL="http://localhost:3010"
RUN npx prisma generate
RUN npm run build
RUN npx esbuild prisma/bootstrap.ts --bundle --platform=node --packages=external --outfile=dist-bootstrap/bootstrap.js

# ═══ Stage 3: Production Runner (Hardened Non-Root & Standalone) ═══
FROM node:22-alpine AS runner
WORKDIR /app

# Ensure OpenSSL and libc compatibility for Prisma Query Engine on Alpine
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Security Hardening: Create unprivileged system user (Non-root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Ensure public uploads directory exists and is owned by nextjs
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app

# Copy Standalone bundle & static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist-bootstrap ./dist-bootstrap

# Copy entrypoint script and ensure Unix line endings & execute permissions
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && \
    chmod +x ./docker-entrypoint.sh && \
    chown nextjs:nodejs ./docker-entrypoint.sh

USER nextjs

EXPOSE 3010

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
CMD ["node", "server.js"]

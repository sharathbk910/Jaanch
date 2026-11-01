# Multi-Stage Production Dockerfile for Jaanch Server
# Stage 1: Build Shared and Server packages
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package files
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install full dependencies for building
RUN npm ci

# Copy source files
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared library and server TypeScript
RUN npm run build -w shared && npm run build -w server

# Stage 2: Production Minimal Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Create application directory with non-root node user
RUN chown -R node:node /app

# Copy package manifests for production install
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node shared/package.json ./shared/
COPY --chown=node:node server/package.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --chown=node:node --from=builder /app/shared/dist ./shared/dist
COPY --chown=node:node --from=builder /app/server/dist ./server/dist

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/api/health || exit 1

CMD ["node", "server/dist/server.js"]


# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml first for better cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including dev dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure cert and env var are available for build
COPY ./certs ./certs
ENV PGSSLROOTCERT=/app/certs/global-bundle.pem

# Build the application with minimal checks
RUN pnpm run build --no-lint

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies only
RUN apk add --no-cache libc6-compat

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/certs ./certs

# Set proper permissions
RUN chown -R nextjs:nodejs .

# Use the non-root user
USER nextjs

EXPOSE 3000

# The actual environment variables will be provided at runtime
CMD ["node_modules/.bin/next", "start"]
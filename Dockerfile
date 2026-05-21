# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install build dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code, generate Prisma client, and build
COPY tsconfig.json prisma.config.ts ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Remove development dependencies after build to keep the final image small
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine AS production

# Install dumb-init for proper process signal forwarding (SIGTERM, SIGINT)
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Copy runtime assets and production node_modules from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Run under a non-privileged user for security
USER node

# Expose port
EXPOSE 3000

# Start application using dumb-init wrapper
CMD ["dumb-init", "npm", "start"]

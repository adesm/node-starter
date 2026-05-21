# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code, configurations and build
COPY tsconfig.json prisma.config.ts ./
COPY src ./src
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:22-alpine

# Install dumb-init for proper process signal forwarding (SIGTERM, SIGINT)
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Run under a non-privileged user for security
USER node

# Copy production dependencies and built files from builder
# We make sure ownership is assigned to node user
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start application using dumb-init wrapper
CMD ["dumb-init", "npm", "start"]

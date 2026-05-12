# Use Node 22 LTS for compatibility
FROM node:22-alpine

WORKDIR /app

# Cache bust: 2026-05-12T23:00:00Z
# Force rebuild without frontend to speed up and save memory on Railway

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies
RUN npm install --omit=dev

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy admin backend package files
COPY admin/backend/package.json admin/backend/package-lock.json ./admin/backend/
RUN cd admin/backend && npm install --omit=dev

# Copy the rest of the source code (frontends are excluded via .dockerignore)
COPY . .

EXPOSE 3000

CMD ["node", "railway-monorepo.js"]

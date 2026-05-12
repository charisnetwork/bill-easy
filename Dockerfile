# Use Node 22 LTS for compatibility with Vite 6+ and React Router 7
FROM node:22-alpine

WORKDIR /app

# Cache bust: 2026-05-12T22:15:00Z
# Force rebuild to fix CORS and health check issues

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

# Copy frontend package files (for build)
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps

# Copy admin frontend package files (for build)
COPY admin/frontend/package.json admin/frontend/package-lock.json ./admin/frontend/
RUN cd admin/frontend && npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build main frontend
RUN cd frontend && npm run build

# Build admin frontend  
RUN cd admin/frontend && npm run build

# Clean up dev dependencies to reduce image size
RUN cd frontend && npm prune --omit=dev
RUN cd admin/frontend && npm prune --omit=dev

EXPOSE 3000

CMD ["node", "railway-monorepo.js"]


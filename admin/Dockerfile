# Build stage for admin frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/admin/frontend
COPY admin/frontend/package*.json ./
RUN npm install --force --legacy-peer-deps
COPY admin/frontend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy admin backend
COPY admin/backend/package*.json ./admin/backend/
RUN cd admin/backend && npm install --force --legacy-peer-deps
COPY admin/backend/ ./admin/backend/

# Copy built frontend from build stage
COPY --from=frontend-build /app/admin/frontend/dist ./admin/frontend/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3025

EXPOSE 3025

CMD ["node", "admin/backend/server.js"]

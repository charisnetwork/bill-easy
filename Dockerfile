# Build stage for frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --force --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --force --legacy-peer-deps
COPY backend/ ./backend/

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "backend/server.js"]

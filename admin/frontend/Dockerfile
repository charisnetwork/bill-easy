# Build stage
FROM node:20-alpine AS build
WORKDIR /app/admin-frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force --legacy-peer-deps

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built files
COPY --from=build /app/admin-frontend/dist ./dist

# Set environment
ENV PORT=3021
EXPOSE 3021

# Start serve
CMD ["serve", "-s", "dist", "-l", "3021"]

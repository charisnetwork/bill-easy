# Build stage
FROM node:20-alpine AS build
WORKDIR /app/frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force --legacy-peer-deps

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Production stage - Serve with Nginx or a simple node server
FROM node:20-alpine
WORKDIR /app

# Install serve to host the static files
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/frontend/dist ./dist

# Set environment
ENV PORT=3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]

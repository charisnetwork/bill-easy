FROM node:20-alpine
WORKDIR /app/admin-backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force --legacy-peer-deps

# Copy backend source
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=3025

EXPOSE 3025

CMD ["node", "server.js"]

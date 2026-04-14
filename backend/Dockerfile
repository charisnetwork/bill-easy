FROM node:20-alpine
WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force --legacy-peer-deps

# Copy backend source
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]

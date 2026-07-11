# Multi-stage Dockerfile for IPL Auction App

# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code files
COPY . .

# Run build (vite build and esbuild server)
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Expose default application port
EXPOSE 3000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "dist/server.cjs"]

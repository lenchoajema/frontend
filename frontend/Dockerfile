# Frontend Dockerfile
# Multi-stage for smaller prod image (optional). For now, run CRA dev server.
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (leverage layer caching)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy application source
COPY . .

# Environment defaults (can be overridden by compose)
ENV PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

# Start the CRA dev server (suitable for Codespaces). For production you could build and serve static.
CMD ["npm", "start"]

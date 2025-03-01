# Use Node.js as base image
FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]

# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Copy helper scripts (also available when repo is bind-mounted in compose)
COPY ./scripts/rotate-traces.sh /app/scripts/rotate-traces.sh
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/scripts/rotate-traces.sh /app/entrypoint.sh || true

# Expose the port the app runs on
EXPOSE 5000

# Use entrypoint to run pre-start tasks (rotation) then exec the main command
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]
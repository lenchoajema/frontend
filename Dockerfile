# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy whole project first (bind-mount may override during compose). Install dependencies only if package.json exists.
COPY . .

# Install dependencies if package.json present (keeps builds resilient when package.json is not committed in this folder)
RUN if [ -f package.json ]; then npm install --no-audit --no-fund; else echo "No package.json found; skipping npm install"; fi

# Copy the rest of the application
COPY . .

# Copy helper scripts (also available when repo is bind-mounted in compose)
COPY ./scripts/rotate-traces.sh /app/scripts/rotate-traces.sh
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/scripts/rotate-traces.sh /app/entrypoint.sh || true

# Expose the port the app runs on
EXPOSE 5000

# Use entrypoint to run pre-start tasks (rotation) then exec the main command.
# Default to running node server.js directly so bind-mounted workspaces without package.json still start.
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
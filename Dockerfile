# MCP Server - Node.js 22 + TypeScript + Fastify
FROM node:22-alpine

WORKDIR /app

# Install system packages
RUN apk add --no-cache curl

# Copy dependency files and install all deps (needed for build)
COPY package*.json ./
RUN npm ci

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript and remove dev dependencies
RUN npm run build && npm prune --production

# Set Node.js environment to production
ENV NODE_ENV=production

# Create non-root user
RUN adduser -u 1001 -D mcpuser
RUN chown -R mcpuser:mcpuser /app
USER mcpuser

# Expose MCP server port
EXPOSE 3000

# Environment variables
ENV HOST=0.0.0.0
ENV MCP_PORT=3000

# Run MCP server (auth token set at runtime)
CMD ["node", "dist/mcp-server.js"]
#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools/index.js';

// Auth helpers
const REQUIRED_TOKEN = process.env.TOKEN;
const isAuthEnabled = () => !!REQUIRED_TOKEN;

const validateToken = (token?: string): boolean => {
  if (!isAuthEnabled()) return true;
  if (!token) return false;
  return token === REQUIRED_TOKEN;
};

const extractBearerToken = (authHeader?: string): string | undefined => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined;
  }
  return authHeader.substring(7);
};

// Create MCP server function
const createMcpServer = () => {
  const server = new McpServer(
    {
      name: 'MCP Server',
      version: '0.0.0'
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    }
  );

  // Register tools
  if (tools?.length) {
    for (const tool of tools) {
      server.tool(tool.name as string, tool.description as string, tool.args || {}, tool.handle as () => Promise<CallToolResult>);
    }
  }

  return server;
};

const MCP_PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    exposedHeaders: ['Mcp-Session-Id']
  })
);

// Authentication middleware
app.use((req, res, next) => {
  if (!isAuthEnabled()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);
  const isAuthenticated = validateToken(token);

  if (!isAuthenticated) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid Bearer token required'
    });
  }

  next();
});

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// MCP POST endpoint
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;

  if (sessionId) {
    console.log(`Received MCP request for session: ${sessionId}`);
  } else {
    console.log('New MCP request');
  }

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: (sessionId: string) => {
          console.log(`Session initialized with ID: ${sessionId}`);
          transports[sessionId] = transport;
        }
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}, removing from transports map`);
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server
      const server = createMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      // Invalid request
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
    }

    // Handle the request with existing transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

// MCP GET endpoint for SSE streams
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;

  if (!sessionId || !transports[sessionId]) {
    return res.status(400).send('Invalid or missing session ID');
  }

  console.log(`Establishing SSE stream for session ${sessionId}`);
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// MCP DELETE endpoint for session termination
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;

  if (!sessionId || !transports[sessionId]) {
    return res.status(400).send('Invalid or missing session ID');
  }

  console.log(`Received session termination request for session ${sessionId}`);
  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
});

// Start server
const host = process.env.HOST || '0.0.0.0';
const port = MCP_PORT;

app.listen(port, host, () => {
  console.log(`🚀 MCP Streamable HTTP Server (Express) running on http://${host}:${port}`);
  console.log(`🔐 Authentication: ${isAuthEnabled() ? 'ENABLED' : 'DISABLED'}`);

  if (isAuthEnabled()) {
    console.log('ℹ️  Use Authorization: Bearer <TOKEN> header to authenticate');
  }
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  // Close all active transports
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId]?.close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.log('Server shutdown complete');
  process.exit(0);
});

export { createMcpServer };

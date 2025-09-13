#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { Task, HealthCheckResponse } from "./types.js";

// Sample data store
const tasksDb: Map<number, Task> = new Map([
  [1, { id: 1, title: "Setup MCP", completed: true, created_at: "2024-01-01T10:00:00" }],
  [2, { id: 2, title: "Write documentation", completed: false, created_at: "2024-01-01T11:00:00" }],
  [3, { id: 3, title: "Deploy to production", completed: false, created_at: "2024-01-01T12:00:00" }],
]);

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
  const server = new McpServer({
    name: "MCP Server",
    version: "0.0.0",
  }, {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  });

  // Register create_task tool
  server.tool('create_task', 'Create a new task', {
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Task description'),
  }, async ({ title, description = "" }) => {
    const taskId = tasksDb.size > 0 ? Math.max(...tasksDb.keys()) + 1 : 1;
    const newTask: Task = {
      id: taskId,
      title,
      description,
      completed: false,
      created_at: new Date().toISOString(),
    };
    
    tasksDb.set(taskId, newTask);
    return {
      content: [{ type: "text", text: JSON.stringify(newTask, null, 2) }],
    };
  });

  // Register complete_task tool
  server.tool('complete_task', 'Mark a task as completed', {
    task_id: z.number().describe('Task ID to complete'),
  }, async ({ task_id }) => {
    const task = tasksDb.get(task_id);
    if (!task) {
      throw new Error(`Task ${task_id} not found`);
    }
    
    task.completed = true;
    task.completed_at = new Date().toISOString();
    tasksDb.set(task_id, task);
    
    return {
      content: [{ type: "text", text: JSON.stringify(task, null, 2) }],
    };
  });

  // Register list_tasks tool
  server.tool('list_tasks', 'List all tasks', {}, async () => {
    const tasks = Array.from(tasksDb.values());
    return {
      content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
    };
  });

  // Register health_check tool
  server.tool('health_check', 'Perform a health check of the server', {}, async () => {
    const healthResponse: HealthCheckResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      server: "MCP Server (Express + Streamable HTTP)",
      tasks_count: tasksDb.size,
      auth_enabled: isAuthEnabled(),
    };
    
    return {
      content: [{ type: "text", text: JSON.stringify(healthResponse, null, 2) }],
    };
  });

  // Register resources
  server.registerResource('all-tasks', 'tasks://all', {
    name: "All Tasks",
    description: "Get all tasks as JSON",
    mimeType: "application/json",
  }, async () => {
    const tasks = Array.from(tasksDb.values());
    return {
      contents: [
        {
          uri: "tasks://all",
          mimeType: "application/json",
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  });

  server.registerResource('pending-tasks', 'tasks://pending', {
    name: "Pending Tasks", 
    description: "Get pending tasks as JSON",
    mimeType: "application/json",
  }, async () => {
    const tasks = Array.from(tasksDb.values()).filter(task => !task.completed);
    return {
      contents: [
        {
          uri: "tasks://pending",
          mimeType: "application/json",
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  });

  server.registerResource('completed-tasks', 'tasks://completed', {
    name: "Completed Tasks",
    description: "Get completed tasks as JSON", 
    mimeType: "application/json",
  }, async () => {
    const tasks = Array.from(tasksDb.values()).filter(task => task.completed);
    return {
      contents: [
        {
          uri: "tasks://completed",
          mimeType: "application/json",
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  });

  // Register task planning prompt
  server.registerPrompt('task_planning', {
    description: "Generate a task planning prompt",
    argsSchema: {
      project: z.string().describe('Project name'),
      deadline: z.string().optional().describe('Project deadline'),
    },
  }, async ({ project, deadline = "no specific deadline" }) => {
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `You are a project management expert. Create a detailed task breakdown for the project '${project}' with deadline: ${deadline}. Include priorities and estimated time for each task.`,
          },
        },
      ],
    };
  });

  return server;
};

const MCP_PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  exposedHeaders: ["Mcp-Session-Id"]
}));

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
      error: "Unauthorized",
      message: "Valid Bearer token required"
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
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
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
          message: 'Internal server error',
        },
        id: null,
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

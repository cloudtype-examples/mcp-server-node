#!/usr/bin/env node

// Test for StreamableHTTP MCP server
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADER = { 'Authorization': 'Bearer test123' };

console.log('Testing StreamableHTTP MCP Server...\n');

// Test 1: Initialize session
console.log('1. Initializing MCP session...');
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  }
};

try {
  const initResponse = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...AUTH_HEADER
    },
    body: JSON.stringify(initRequest)
  });

  const initData = await initResponse.json();
  console.log('Initialize Response:', JSON.stringify(initData, null, 2));
  
  const sessionId = initResponse.headers.get('mcp-session-id');
  console.log('Session ID:', sessionId);

  if (!sessionId) {
    console.error('No session ID received!');
    process.exit(1);
  }

  // Test 2: List tools
  console.log('\n2. Listing available tools...');
  const toolsRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };

  const toolsResponse = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId,
      ...AUTH_HEADER
    },
    body: JSON.stringify(toolsRequest)
  });

  const toolsData = await toolsResponse.json();
  console.log('Tools Response:', JSON.stringify(toolsData, null, 2));

  // Test 3: Call list_tasks tool
  console.log('\n3. Calling list_tasks tool...');
  const callToolRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "list_tasks",
      arguments: {}
    }
  };

  const callToolResponse = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId,
      ...AUTH_HEADER
    },
    body: JSON.stringify(callToolRequest)
  });

  const callToolData = await callToolResponse.json();
  console.log('List Tasks Response:', JSON.stringify(callToolData, null, 2));

  // Test 4: List resources
  console.log('\n4. Listing available resources...');
  const resourcesRequest = {
    jsonrpc: "2.0",
    id: 4,
    method: "resources/list",
    params: {}
  };

  const resourcesResponse = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId,
      ...AUTH_HEADER
    },
    body: JSON.stringify(resourcesRequest)
  });

  const resourcesData = await resourcesResponse.json();
  console.log('Resources Response:', JSON.stringify(resourcesData, null, 2));

  // Test 5: Read a resource
  console.log('\n5. Reading a resource...');
  const readResourceRequest = {
    jsonrpc: "2.0",
    id: 5,
    method: "resources/read",
    params: {
      uri: "tasks://all"
    }
  };

  const readResourceResponse = await fetch(`${BASE_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId,
      ...AUTH_HEADER
    },
    body: JSON.stringify(readResourceRequest)
  });

  const readResourceData = await readResourceResponse.json();
  console.log('Read Resource Response:', JSON.stringify(readResourceData, null, 2));

  console.log('\n✅ All tests completed successfully!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
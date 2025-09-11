#!/usr/bin/env node

/**
 * Simple test client to verify MCP server functionality
 * This demonstrates how to interact with the MCP server
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const serverProcess = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

function sendMessage(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    id: messageId++,
    method,
    params
  };
  
  const messageStr = JSON.stringify(message) + '\n';
  serverProcess.stdin.write(messageStr);
  console.log('Sent:', JSON.stringify(message, null, 2));
}

serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('Received:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw output:', line);
      }
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

// Initialize the connection
console.log('🔄 Initializing MCP connection...');
sendMessage('initialize', {
  protocolVersion: "2024-11-05",
  capabilities: {
    tools: {}
  },
  clientInfo: {
    name: "test-client",
    version: "1.0.0"
  }
});

// Test sequence after a short delay
setTimeout(() => {
  console.log('\n📋 Testing tools...');
  sendMessage('tools/list');
  
  setTimeout(() => {
    console.log('\n📋 Testing create_task...');
    sendMessage('tools/call', {
      name: 'create_task',
      arguments: {
        title: 'Test Task from Node.js',
        description: 'This task was created by the test client'
      }
    });
    
    setTimeout(() => {
      console.log('\n📋 Testing list_tasks...');
      sendMessage('tools/call', {
        name: 'list_tasks',
        arguments: {}
      });
      
      setTimeout(() => {
        console.log('\n🔍 Testing resources...');
        sendMessage('resources/list');
        
        setTimeout(() => {
          console.log('\n✅ Test complete, shutting down...');
          serverProcess.kill();
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}, 2000);

serverProcess.on('close', (code) => {
  console.log(`\n🏁 Server process exited with code ${code}`);
  process.exit(0);
});
#!/usr/bin/env node

// Test MCP server running in Docker
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const AUTH_HEADER = { 'Authorization': 'Bearer test123' };

console.log('Testing MCP Server in Docker...\n');

async function testMCP() {
  try {
    // Test 1: Initialize session
    console.log('1. 🚀 Initializing MCP session...');
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
    console.log('✅ Initialize Response:', JSON.stringify(initData.result.serverInfo, null, 2));
    
    const sessionId = initResponse.headers.get('mcp-session-id');
    if (!sessionId) {
      console.error('❌ No session ID received!');
      return;
    }
    console.log('📋 Session ID:', sessionId);

    // Test 2: List initial tasks
    console.log('\n2. 📋 Listing initial tasks...');
    const listTasksRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_tasks",
        arguments: {}
      }
    };

    const listResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': sessionId,
        ...AUTH_HEADER
      },
      body: JSON.stringify(listTasksRequest)
    });

    const listData = await listResponse.json();
    const initialTasks = JSON.parse(listData.result.content[0].text);
    console.log('✅ Initial tasks:', initialTasks.length, 'tasks found');
    initialTasks.forEach(task => {
      console.log(`   - [${task.completed ? '✓' : ' '}] ${task.title} (ID: ${task.id})`);
    });

    // Test 3: Create a new task
    console.log('\n3. ➕ Creating new task...');
    const createTaskRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "create_task",
        arguments: {
          title: "Test Docker deployment",
          description: "Verify MCP server works in Docker container"
        }
      }
    };

    const createResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': sessionId,
        ...AUTH_HEADER
      },
      body: JSON.stringify(createTaskRequest)
    });

    const createData = await createResponse.json();
    const newTask = JSON.parse(createData.result.content[0].text);
    console.log('✅ New task created:', newTask.title, `(ID: ${newTask.id})`);

    // Test 4: Complete the new task
    console.log('\n4. ✅ Completing the new task...');
    const completeTaskRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "complete_task",
        arguments: {
          task_id: newTask.id
        }
      }
    };

    const completeResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': sessionId,
        ...AUTH_HEADER
      },
      body: JSON.stringify(completeTaskRequest)
    });

    const completeData = await completeResponse.json();
    const completedTask = JSON.parse(completeData.result.content[0].text);
    console.log('✅ Task completed:', completedTask.title, `(Completed at: ${completedTask.completed_at})`);

    // Test 5: List all tasks again
    console.log('\n5. 📋 Listing all tasks after changes...');
    const finalListResponse = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Mcp-Session-Id': sessionId,
        ...AUTH_HEADER
      },
      body: JSON.stringify(listTasksRequest)
    });

    const finalListData = await finalListResponse.json();
    const finalTasks = JSON.parse(finalListData.result.content[0].text);
    console.log('✅ Final tasks:', finalTasks.length, 'tasks total');
    finalTasks.forEach(task => {
      console.log(`   - [${task.completed ? '✓' : ' '}] ${task.title} (ID: ${task.id})`);
    });

    // Test 6: Test resources
    console.log('\n6. 📁 Testing resources...');
    const resourcesRequest = {
      jsonrpc: "2.0",
      id: 6,
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
    console.log('✅ Available resources:', resourcesData.result.resources.length);
    resourcesData.result.resources.forEach(resource => {
      console.log(`   - ${resource.name}: ${resource.uri}`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('🐳 Docker MCP server is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMCP();
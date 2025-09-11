#!/usr/bin/env node

/**
 * Test script for Bearer token authentication
 */

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  const validToken = process.env.TOKEN || 'test123';

  console.log('🔐 Testing Bearer Token Authentication');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Token: ${validToken}`);
  console.log();

  // Test 1: No authorization header
  console.log('📝 Test 1: No authorization header');
  try {
    const response = await fetch(`${baseUrl}/tools`);
    if (response.status === 401) {
      console.log('✅ Correctly rejected unauthorized request');
    } else {
      console.log(`❌ Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  // Test 2: Invalid token
  console.log('\n📝 Test 2: Invalid token');
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
    if (response.status === 401) {
      console.log('✅ Correctly rejected invalid token');
    } else {
      console.log(`❌ Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  // Test 3: Valid token
  console.log('\n📝 Test 3: Valid token');
  try {
    const response = await fetch(`${baseUrl}/tools`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Successfully authenticated');
      console.log(`   Found ${data.tools.length} tools`);
    } else {
      console.log(`❌ Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  // Test 4: Create task with authentication
  console.log('\n📝 Test 4: Create task with authentication');
  try {
    const response = await fetch(`${baseUrl}/tools/create_task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Authenticated Task',
        description: 'This task was created with Bearer token auth'
      })
    });
    
    if (response.status === 200) {
      const task = await response.json();
      console.log('✅ Successfully created task with authentication');
      console.log(`   Task ID: ${task.id}, Title: ${task.title}`);
    } else {
      console.log(`❌ Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  // Test 5: Health check with auth status
  console.log('\n📝 Test 5: Health check with auth status');
  try {
    const response = await fetch(`${baseUrl}/tools/health_check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (response.status === 200) {
      const health = await response.json();
      console.log('✅ Health check successful');
      console.log(`   Server: ${health.server}`);
      console.log(`   Auth enabled: ${health.auth_enabled}`);
      console.log(`   Tasks count: ${health.tasks_count}`);
    } else {
      console.log(`❌ Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  console.log('\n🏁 Authentication tests completed');
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuth().catch(console.error);
}
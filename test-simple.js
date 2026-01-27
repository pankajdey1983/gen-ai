#!/usr/bin/env node

/**
 * Simple test to verify the server starts correctly
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Load environment variables
config();

console.log('🧪 Testing MCP Server Startup...\n');

// Check if environment variables are set
if (!process.env.AZURE_DEVOPS_ORG_URL) {
  console.log('⚠️  Warning: .env file not configured properly');
  console.log('Edit .env file with your Azure DevOps credentials to test with real API calls\n');
  console.log('For now, testing server startup only...\n');
}

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: process.env,
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  },
};

console.log('📤 Sending initialize request...');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Send list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
};

setTimeout(() => {
  console.log('📤 Requesting tools list...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 500);

let responseCount = 0;

server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  
  // Handle multiple JSON responses
  const lines = response.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const json = JSON.parse(line);
      responseCount++;
      
      console.log(`\n📥 Response ${responseCount}:`);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.result?.tools) {
        console.log(`\n✅ Success! Found ${json.result.tools.length} tools:`);
        json.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
      }
    } catch (e) {
      console.log('📝 Output:', line);
    }
  });
  
  if (responseCount >= 2) {
    console.log('\n✅ Server test completed successfully!');
    server.kill();
    process.exit(0);
  }
});

server.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n⏱️ Test timeout - stopping server');
  server.kill();
  process.exit(1);
}, 5000);

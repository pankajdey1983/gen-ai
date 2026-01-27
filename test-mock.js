#!/usr/bin/env node

/**
 * Mock test - Tests the MCP server without Azure DevOps credentials
 * This verifies the server structure works correctly
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Load environment variables
config();

console.log('🧪 MCP Server Mock Test\n');

// Set mock environment variables if not present
if (!process.env.AZURE_DEVOPS_ORG_URL) {
  console.log('📝 Using mock credentials for testing...\n');
  process.env.AZURE_DEVOPS_ORG_URL = 'https://dev.azure.com/mock-org';
  process.env.AZURE_DEVOPS_PAT = 'mock-token';
  process.env.AZURE_DEVOPS_PROJECT = 'MockProject';
  process.env.AZURE_DEVOPS_REPOSITORY = 'MockRepo';
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

// Test get_coding_patterns (doesn't require Azure DevOps)
const getPatternsRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'get_coding_patterns',
    arguments: {},
  },
};

setTimeout(() => {
  console.log('📤 Testing get_coding_patterns tool...');
  server.stdin.write(JSON.stringify(getPatternsRequest) + '\n');
}, 1000);

let responseCount = 0;
const expectedResponses = 3;

server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  
  // Handle multiple JSON responses
  const lines = response.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const json = JSON.parse(line);
      responseCount++;
      
      console.log(`\n📥 Response ${responseCount}:`);
      
      if (json.result?.tools) {
        console.log(`✅ Server initialized with ${json.result.tools.length} tools:`);
        json.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}`);
        });
      } else if (json.result?.content) {
        console.log(`✅ Tool executed successfully`);
        if (json.result.content[0]?.text) {
          const text = json.result.content[0].text;
          console.log(`   Output: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        }
      } else {
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      // Ignore non-JSON output
    }
  });
  
  if (responseCount >= expectedResponses) {
    console.log('\n✅ All tests passed! Server is working correctly.\n');
    console.log('📋 Next steps:');
    console.log('   1. Edit .env with your Azure DevOps credentials');
    console.log('   2. Run: node test-simple.js (to test with real API)');
    console.log('   3. Or add to VS Code MCP settings to use with Copilot\n');
    server.kill();
    process.exit(0);
  }
});

server.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

setTimeout(() => {
  if (responseCount < expectedResponses) {
    console.log(`\n⚠️  Only received ${responseCount}/${expectedResponses} responses`);
    console.log('Server may not be responding correctly');
  }
  server.kill();
  process.exit(responseCount >= expectedResponses ? 0 : 1);
}, 3000);

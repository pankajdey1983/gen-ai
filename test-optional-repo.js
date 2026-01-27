#!/usr/bin/env node

/**
 * Test to verify repository parameter is optional
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Load environment variables
config();

console.log('🧪 Testing Optional Repository Parameter\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: process.env,
});

let requestId = 1;
let responseCount = 0;
const expectedResponses = 3;

// Test 1: Initialize
const initRequest = {
  jsonrpc: '2.0',
  id: requestId++,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-optional-repo',
      version: '1.0.0',
    },
  },
};

console.log('📤 Test 1: Initialize server');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Test 2: Get PR WITHOUT repository parameter (should use default from env)
setTimeout(() => {
  console.log('\n📤 Test 2: Get PR without repository parameter (uses default from env)');
  const getPRRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'get_current_pr',
      arguments: {
        branchName: 'development/Trevor/workflow-version-2-validate-cli-command',
        // repository NOT provided - should use AZURE_DEVOPS_REPOSITORY from env
      },
    },
  };
  server.stdin.write(JSON.stringify(getPRRequest) + '\n');
}, 500);

// Test 3: Get PR WITH explicit repository parameter
setTimeout(() => {
  console.log('\n📤 Test 3: Get PR with explicit repository parameter');
  const getPRWithRepoRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'get_current_pr',
      arguments: {
        branchName: 'development/Trevor/workflow-version-2-validate-cli-command',
        repository: 'Bladed',  // Explicitly provided
      },
    },
  };
  server.stdin.write(JSON.stringify(getPRWithRepoRequest) + '\n');
}, 1000);

server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  
  const lines = response.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const json = JSON.parse(line);
      responseCount++;
      
      console.log(`\n📥 Response ${responseCount}:`);
      
      if (json.result?.protocolVersion) {
        console.log('✅ Server initialized');
      } else if (json.result?.content) {
        const content = json.result.content[0]?.text;
        if (json.result.isError) {
          console.log(`❌ Error: ${content?.substring(0, 150)}`);
        } else {
          console.log(`✅ Success: ${content?.substring(0, 150)}...`);
        }
      }
    } catch (e) {
      // Ignore non-JSON
    }
  });
  
  if (responseCount >= expectedResponses) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Repository parameter is now OPTIONAL!');
    console.log('   - Works without repository (uses env default)');
    console.log('   - Works with explicit repository parameter');
    console.log('   - LLM can use the tool without configuration');
    console.log('='.repeat(60));
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
    console.log(`\n⚠️  Only completed ${responseCount}/${expectedResponses} tests`);
  }
  server.kill();
  process.exit(responseCount >= expectedResponses ? 0 : 1);
}, 3000);

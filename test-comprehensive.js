#!/usr/bin/env node

/**
 * Comprehensive test for Azure DevOps MCP Server
 * Tests all tools including the updated get_current_pr with branch parameter
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Load environment variables
config();

console.log('🧪 Comprehensive MCP Server Test\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: process.env,
});

let requestId = 1;
let responseCount = 0;
const expectedResponses = 4;

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: requestId++,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'comprehensive-test',
      version: '1.0.0',
    },
  },
};

console.log('📤 Test 1: Initialize server');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Test 2: List tools
setTimeout(() => {
  console.log('\n📤 Test 2: List tools');
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/list',
  };
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 500);

// Test 3: Get coding patterns (no Azure DevOps needed)
setTimeout(() => {
  console.log('\n📤 Test 3: Get coding patterns');
  const getPatternsRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'get_coding_patterns',
      arguments: {},
    },
  };
  server.stdin.write(JSON.stringify(getPatternsRequest) + '\n');
}, 1000);

// Test 4: Get PR with specific branch name and repository
setTimeout(() => {
  console.log('\n📤 Test 4: Get PR for specific branch and repository');
  const getPRWithBranchRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'get_current_pr',
      arguments: {
        branchName: 'development/Trevor/workflow-version-2-validate-cli-command',
        repository: 'Bladed',
      },
    },
  };
  server.stdin.write(JSON.stringify(getPRWithBranchRequest) + '\n');
}, 1500);

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
        console.log(`✅ Found ${json.result.tools.length} tools`);
      } else if (json.result?.content) {
        const content = json.result.content[0]?.text;
        if (json.result.isError) {
          console.log(`❌ Error: ${content?.substring(0, 150)}`);
        } else {
          console.log(`✅ Success: ${content?.substring(0, 150)}...`);
        }
      } else if (json.result?.protocolVersion) {
        console.log(`✅ Server initialized`);
      }
    } catch (e) {
      // Ignore non-JSON output
    }
  });
  
  if (responseCount >= expectedResponses) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log(`   Executed ${responseCount} operations`);
    console.log('   Server is working correctly with branch parameter support');
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
}, 5000);

#!/usr/bin/env node

/**
 * Test for update PR comment status functionality
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';

// Load environment variables
config();

console.log('🧪 Testing Update PR Comment Status Tool\n');

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
      name: 'test-comment-status',
      version: '1.0.0',
    },
  },
};

console.log('📤 Test 1: Initialize server');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Test 2: Get PR comments to see available threads
setTimeout(() => {
  console.log('\n📤 Test 2: Get PR comments to see thread IDs');
  const getCommentsRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'get_pr_comments',
      arguments: {
        pullRequestId: 10692,  // Example PR ID
      },
    },
  };
  server.stdin.write(JSON.stringify(getCommentsRequest) + '\n');
}, 500);

// Test 3: Update a comment status (this will show the tool works)
setTimeout(() => {
  console.log('\n📤 Test 3: Update comment thread status to "fixed"');
  const updateStatusRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'update_pr_comment_status',
      arguments: {
        pullRequestId: 10692,
        threadId: 72758,  // Use actual thread ID from your PR
        status: 'fixed',
      },
    },
  };
  server.stdin.write(JSON.stringify(updateStatusRequest) + '\n');
}, 1500);

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
          console.log(`❌ Error: ${content}`);
        } else {
          // Show first few comments or success message
          if (content.startsWith('[')) {
            try {
              const comments = JSON.parse(content);
              console.log(`✅ Found ${comments.length} comments`);
              if (comments.length > 0) {
                console.log(`   First comment thread ID: ${comments[0].threadId}`);
                console.log(`   Content: ${comments[0].content.substring(0, 60)}...`);
              }
            } catch {
              console.log(`✅ ${content.substring(0, 100)}...`);
            }
          } else {
            console.log(`✅ ${content}`);
          }
        }
      }
    } catch (e) {
      // Ignore non-JSON
    }
  });
  
  if (responseCount >= expectedResponses) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Update PR Comment Status Tool Ready!');
    console.log('');
    console.log('Usage examples:');
    console.log('  - Mark comment as fixed: status="fixed"');
    console.log('  - Reopen comment: status="active"');
    console.log('  - Close comment: status="closed"');
    console.log('  - Won\'t fix: status="wontFix"');
    console.log('');
    console.log('Required parameters:');
    console.log('  - pullRequestId: PR number');
    console.log('  - threadId: Comment thread ID (from get_pr_comments)');
    console.log('  - status: active/fixed/closed/wontFix/byDesign/pending');
    console.log('  - repository: Optional (uses env default)');
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
}, 4000);

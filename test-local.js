#!/usr/bin/env node

/**
 * Local testing script for Azure DevOps MCP Server
 * This helps you test the server interactively
 */

import { config } from 'dotenv';
import { spawn } from 'child_process';
import readline from 'readline';

// Load environment variables from .env file
config();

console.log('🧪 Azure DevOps MCP Server - Local Test Mode\n');
console.log('This will start the MCP server and allow you to send test requests.\n');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: process.env,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let requestId = 1;

// Listen to server responses
server.stdout.on('data', (data) => {
  const response = data.toString();
  try {
    const json = JSON.parse(response);
    console.log('\n📥 Server Response:');
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('\n📥 Server Output:', response);
  }
  promptUser();
});

server.on('exit', (code) => {
  console.log(`\n❌ Server exited with code ${code}`);
  process.exit(code);
});

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method,
    params,
  };
  
  console.log('\n📤 Sending request:');
  console.log(JSON.stringify(request, null, 2));
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

function promptUser() {
  console.log('\n' + '='.repeat(60));
  console.log('Available commands:');
  console.log('  1 - List available tools');
  console.log('  2 - Get current PR');
  console.log('  3 - Get PR comments (requires PR ID)');
  console.log('  4 - Read file content (requires file path)');
  console.log('  5 - Get coding patterns');
  console.log('  6 - Add coding pattern');
  console.log('  7 - Update PR comment status');
  console.log('  8 - Get PR file changes (requires PR ID)');
  console.log('  9 - Initialize (send initialize request)');
  console.log('  q - Quit');
  console.log('='.repeat(60));
  
  rl.question('\nEnter command number: ', (answer) => {
    handleCommand(answer.trim());
  });
}

function handleCommand(cmd) {
  switch (cmd) {
    case '1':
      sendRequest('tools/list');
      break;
      
    case '2':
      rl.question('Enter branch name: ', (branchName) => {
        if (!branchName.trim()) {
          console.log('❌ Branch name is required');
          promptUser();
          return;
        }
        rl.question('Enter repository name (or press Enter for default): ', (repository) => {
          const args = { branchName: branchName.trim() };
          if (repository.trim()) {
            args.repository = repository.trim();
          }
          sendRequest('tools/call', {
            name: 'get_current_pr',
            arguments: args,
          });
        });
      });
      break;
      
    case '3':
      rl.question('Enter PR ID: ', (prId) => {
        rl.question('Enter repository name (or press Enter for default): ', (repository) => {
          const args = { pullRequestId: parseInt(prId) };
          if (repository.trim()) {
            args.repository = repository.trim();
          }
          sendRequest('tools/call', {
            name: 'get_pr_comments',
            arguments: args,
          });
        });
      });
      break;
      
    case '4':
      rl.question('Enter file path: ', (filePath) => {
        sendRequest('tools/call', {
          name: 'read_file_content',
          arguments: { filePath },
        });
      });
      break;
      
    case '5':
      sendRequest('tools/call', {
        name: 'get_coding_patterns',
        arguments: {},
      });
      break;
      
    case '6':
      rl.question('Pattern name: ', (name) => {
        rl.question('Description: ', (description) => {
          rl.question('Category: ', (category) => {
            sendRequest('tools/call', {
              name: 'add_coding_pattern',
              arguments: { name, description, category },
            });
          });
        });
      });
      break;
      
    case '7':
      rl.question('Enter PR ID: ', (prId) => {
        rl.question('Enter thread ID: ', (threadId) => {
          rl.question('Enter status (active/fixed/closed/wontFix/byDesign/pending): ', (status) => {
            rl.question('Enter repository name (or press Enter for default): ', (repository) => {
              const args = {
                pullRequestId: parseInt(prId),
                threadId: parseInt(threadId),
                status: status.trim(),
              };
              if (repository.trim()) {
                args.repository = repository.trim();
              }
              sendRequest('tools/call', {
                name: 'update_pr_comment_status',
                arguments: args,
              });
            });
          });
        });
      });
      break;
      
    case '8':
      rl.question('Enter PR ID: ', (prId) => {
        rl.question('Enter repository name (or press Enter for default): ', (repository) => {
          const args = { pullRequestId: parseInt(prId) };
          if (repository.trim()) {
            args.repository = repository.trim();
          }
          sendRequest('tools/call', {
            name: 'get_pr_changes',
            arguments: args,
          });
        });
      });
      break;
      
    case '9':
      sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      });
      break;
      
    case 'q':
      console.log('\n👋 Goodbye!');
      server.kill();
      process.exit(0);
      break;
      
    default:
      console.log('❌ Invalid command');
      promptUser();
      break;
  }
}

console.log('⏳ Starting server...\n');
setTimeout(() => {
  promptUser();
}, 1000);

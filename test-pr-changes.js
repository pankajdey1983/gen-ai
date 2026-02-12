/**
 * Test script for PR changes functionality
 * Tests the get_pr_changes tool to fetch file changes (diffs) for a PR
 */

import { spawn } from 'child_process';

console.log('🧪 Testing Azure DevOps MCP Server - PR Changes Feature\n');

const messages = [
  {
    role: 'user',
    content: {
      type: 'text',
      text: 'Initialize connection'
    }
  }
];

// Start the MCP server
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';
let testsPassed = 0;
let testsFailed = 0;

serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // Process complete JSON-RPC messages
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const response = JSON.parse(line);
      
      // Handle list tools response
      if (response.result?.tools) {
        console.log('✅ Server initialized successfully');
        console.log(`📋 Available tools: ${response.result.tools.length}`);
        
        const prChangesTool = response.result.tools.find(t => t.name === 'get_pr_changes');
        if (prChangesTool) {
          console.log('✅ Found get_pr_changes tool\n');
          testsPassed++;
          
          // Test 1: Get PR changes for PR 10692
          console.log('Test 1: Fetching file changes for PR 10692...');
          sendRequest({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'get_pr_changes',
              arguments: {
                pullRequestId: 10692
              }
            }
          });
        } else {
          console.error('❌ get_pr_changes tool not found');
          testsFailed++;
          serverProcess.kill();
          process.exit(1);
        }
      }
      
      // Handle tool call responses
      if (response.id === 2 && response.result?.content) {
        const content = response.result.content[0].text;
        console.log('\n📄 PR Changes Response:');
        console.log('━'.repeat(60));
        console.log(content);
        console.log('━'.repeat(60));
        
        if (content.includes('File Changes for PR')) {
          console.log('\n✅ Test 1 PASSED: Successfully retrieved PR changes');
          testsPassed++;
        } else if (content.includes('No file changes found')) {
          console.log('\n⚠️  Test 1: No changes found (PR may be empty)');
          testsPassed++;
        } else {
          console.log('\n❌ Test 1 FAILED: Unexpected response format');
          testsFailed++;
        }
        
        // Test 2: Try with a different PR if available
        console.log('\n\nTest 2: Fetching file changes for PR 10695...');
        sendRequest({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'get_pr_changes',
            arguments: {
              pullRequestId: 10695
            }
          }
        });
      }
      
      if (response.id === 3 && response.result?.content) {
        const content = response.result.content[0].text;
        console.log('\n📄 PR Changes Response:');
        console.log('━'.repeat(60));
        console.log(content);
        console.log('━'.repeat(60));
        
        if (content.includes('File Changes for PR') || content.includes('No file changes found')) {
          console.log('\n✅ Test 2 PASSED: Successfully handled second PR request');
          testsPassed++;
        } else {
          console.log('\n❌ Test 2 FAILED: Unexpected response format');
          testsFailed++;
        }
        
        // Summary and cleanup
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary:');
        console.log(`✅ Passed: ${testsPassed}`);
        console.log(`❌ Failed: ${testsFailed}`);
        console.log('='.repeat(60));
        
        if (testsFailed === 0) {
          console.log('\n🎉 All tests passed! PR changes feature is working correctly.\n');
          console.log('💡 Usage:');
          console.log('   - Use get_pr_changes to fetch all file changes for a PR');
          console.log('   - Returns change type (add/edit/delete/rename) and file paths');
          console.log('   - Useful for code review before providing feedback');
        }
        
        serverProcess.kill();
        process.exit(testsFailed > 0 ? 1 : 0);
      }
      
      // Handle errors
      if (response.error) {
        console.error(`\n❌ Error: ${response.error.message}`);
        testsFailed++;
        serverProcess.kill();
        process.exit(1);
      }
      
    } catch (e) {
      // Not JSON or incomplete message, ignore
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

serverProcess.on('close', (code) => {
  if (code !== 0 && testsFailed === 0) {
    console.error(`\n❌ Server process exited with code ${code}`);
    process.exit(1);
  }
});

// Helper function to send JSON-RPC requests
function sendRequest(request) {
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

// Initialize with list tools request
sendRequest({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n❌ Test timeout - server did not respond in time');
  serverProcess.kill();
  process.exit(1);
}, 30000);

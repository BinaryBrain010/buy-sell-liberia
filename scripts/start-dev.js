const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development servers...\n');

// Start Next.js dev server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Wait a bit for Next.js to start, then start socket server
setTimeout(() => {
  console.log('\n🔌 Starting Socket.io server...\n');
  
  const socketServer = spawn('npm', ['run', 'dev:socket'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  socketServer.on('error', (error) => {
    console.error('❌ Socket server error:', error);
  });

  socketServer.on('close', (code) => {
    console.log(`🔌 Socket server exited with code ${code}`);
  });
}, 3000);

nextDev.on('error', (error) => {
  console.error('❌ Next.js error:', error);
});

nextDev.on('close', (code) => {
  console.log(`🚀 Next.js exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  nextDev.kill('SIGINT');
  process.exit(0);
});

module.exports = {
        apps: [
          {
            name: 'website',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: './',
            watch: false, // Disable file watching to avoid conflicts
            instances: 1, // Use a single instance to avoid cluster issues
            exec_mode: 'fork', // Use fork mode instead of cluster
            env: {
              NODE_ENV: 'production',
            },
          },
        ],
      };
      
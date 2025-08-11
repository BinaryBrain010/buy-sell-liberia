# Sockets API

## Overview
This API route (`/api/sockets`) sets up a Socket.IO server for real-time communication in your Next.js app.

## CORS Configuration
- The server allows connections from the origin specified in the `SOCKET_CLIENT_ORIGIN` environment variable, or defaults to `http://localhost:3000`.
- Methods allowed: `GET`, `POST`.
- Credentials are supported.

## Frontend Connection Example
```
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/api/sockets',
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to socket server:', socket.id);
});

// Listen for custom events
// socket.on('eventName', (data) => { ... });
```

## Reverse Proxy (Optional)
If deploying behind a reverse proxy (e.g., NGINX), ensure WebSocket upgrade headers are forwarded for `/api/sockets`.

Example NGINX config:
```
location /api/sockets/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

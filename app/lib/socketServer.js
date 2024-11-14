// lib/socketServer.js

import { Server } from 'socket.io';

let io;

export const initSocketServer = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  return io;
};

export const getSocketServer = () => io;

import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    // 📍 Driver sends live location
    socket.on('updateLocation', (data) => {
      // data = { truckId, lat, lng }

      io.emit('locationUpdated', data);
    });

    // 🚚 Trip status update
    socket.on('tripStatus', (data) => {
      io.emit('tripStatusUpdated', data);
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });
};

export const getIO = () => io;

export const emitLocationUpdated = (data) => {
  if (io) {
    io.emit('locationUpdated', data);
  }
};

export const emitTripStatusUpdated = (data) => {
  if (io) {
    io.emit('tripStatusUpdated', data);
  }
};

export const emitGeofenceAlert = (data) => {
  if (io) {
    io.emit('geofenceAlert', data);
  }
};


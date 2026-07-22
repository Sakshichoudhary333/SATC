import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
    },
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    // 🚪 Join Room handlers
    socket.on('joinTruck', ({ truckId }) => {
      if (truckId) {
        socket.join(`truck_${truckId}`);
        logger.info(`Socket ${socket.id} joined room truck_${truckId}`);
      }
    });

    socket.on('joinTrip', ({ tripId }) => {
      if (tripId) {
        socket.join(`trip_${tripId}`);
        logger.info(`Socket ${socket.id} joined room trip_${tripId}`);
      }
    });

    // 🚪 Leave Room handlers
    socket.on('leaveTruck', ({ truckId }) => {
      if (truckId) {
        socket.leave(`truck_${truckId}`);
        logger.info(`Socket ${socket.id} left room truck_${truckId}`);
      }
    });

    socket.on('leaveTrip', ({ tripId }) => {
      if (tripId) {
        socket.leave(`trip_${tripId}`);
        logger.info(`Socket ${socket.id} left room trip_${tripId}`);
      }
    });

    // 📍 Driver sends live location
    socket.on('updateLocation', (data) => {
      // data = { truckId, lat, lng, tripId }
      if (data.truckId) {
        io.to(`truck_${data.truckId}`).emit('locationUpdated', data);
      }
      if (data.tripId) {
        io.to(`trip_${data.tripId}`).emit('locationUpdated', data);
      }
    });

    // 🚚 Trip status update
    socket.on('tripStatus', (data) => {
      if (data.truckId) {
        io.to(`truck_${data.truckId}`).emit('tripStatusUpdated', data);
      }
      if (data.tripId) {
        io.to(`trip_${data.tripId}`).emit('tripStatusUpdated', data);
      }
    });

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });
};

export const getIO = () => io;

export const emitLocationUpdated = (data) => {
  if (io) {
    if (data.truckId) {
      io.to(`truck_${data.truckId}`).emit('locationUpdated', data);
    }
    if (data.tripId) {
      io.to(`trip_${data.tripId}`).emit('locationUpdated', data);
    }
  }
};

export const emitTripStatusUpdated = (data) => {
  if (io) {
    if (data.truckId) {
      io.to(`truck_${data.truckId}`).emit('tripStatusUpdated', data);
    }
    if (data.tripId) {
      io.to(`trip_${data.tripId}`).emit('tripStatusUpdated', data);
    }
  }
};

export const emitGeofenceAlert = (data) => {
  if (io) {
    if (data.truckId) {
      io.to(`truck_${data.truckId}`).emit('geofenceAlert', data);
    }
    if (data.tripId) {
      io.to(`trip_${data.tripId}`).emit('geofenceAlert', data);
    }
  }
};

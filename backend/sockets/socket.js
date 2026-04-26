import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

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
      console.log('Socket disconnected');
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

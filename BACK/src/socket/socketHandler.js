/**
 * socketHandler.js - Gestion des connexions WebSocket via Socket.io.
 * Définit les rooms (kitchen, delivery, cashier, table_{id}) pour le temps réel,
 * et exporte les noms des événements (order:created, order:status_changed, etc.).
 */
const { Server } = require('socket.io');

let io;

// Initialisation de Socket.io avec le serveur HTTP
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  // Gestion des connexions WebSocket
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Rejoindre une room générique
    socket.on('join_room', (data) => {
      const { room, role } = data;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room} as ${role}`);
    });

    // Room cuisine : reçoit les nouvelles commandes
    socket.on('join_kitchen', () => {
      socket.join('kitchen');
      console.log(`Socket ${socket.id} joined kitchen room`);
    });

    // Room livraison : reçoit les commandes à livrer
    socket.on('join_delivery', () => {
      socket.join('delivery');
      console.log(`Socket ${socket.id} joined delivery room`);
    });

    // Room caisse : reçoit les notifications de paiement
    socket.on('join_cashier', () => {
      socket.join('cashier');
      console.log(`Socket ${socket.id} joined cashier room`);
    });

    // Room table spécifique : reçoit les mises à jour de cette table
    socket.on('join_table', (tableId) => {
      socket.join(`table_${tableId}`);
      console.log(`Socket ${socket.id} joined table_${tableId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Récupération de l'instance Socket.io (utilisée dans les contrôleurs)
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Noms des événements Socket.io
const socketEvents = {
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_ITEM_STATUS_CHANGED: 'order_item:status_changed',
  TABLE_STATUS_CHANGED: 'table:status_changed',
  NEW_RESERVATION: 'reservation:new',
  RESERVATION_STATUS_CHANGED: 'reservation:status_changed',
  PAYMENT_COMPLETED: 'payment:completed',
  NEW_REVIEW: 'review:new',
  NOTIFICATION: 'notification'
};

module.exports = { initSocket, getIO, socketEvents };

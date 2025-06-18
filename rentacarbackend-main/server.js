// server.js

require("dotenv").config();
const config = require("./utils/config");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const app = require("./app");
const { connectDB } = require("./db");
const setupSocket = require("./socketServer");

global.gfs = null;

mongoose.connection.once("open", () => {
  const { GridFSBucket } = require("mongodb");
  global.gfs = new GridFSBucket(mongoose.connection.db);
});

const port = process.env.PORT || 3001;

// Create the server first
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Setup Socket.IO with debug logging
const io = setupSocket(server);

io.on('connect', (socket) => {
  console.log('Socket connected:', socket.id);
});

io.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Make both server and io available for import
module.exports = { server, io };
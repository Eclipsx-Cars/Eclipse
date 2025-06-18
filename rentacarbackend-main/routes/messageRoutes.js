const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Get messages between two users
router.get("/:userId/:receiverId", messageController.getMessages);

// Send a new message
router.post("/", messageController.sendMessage);

module.exports = router;
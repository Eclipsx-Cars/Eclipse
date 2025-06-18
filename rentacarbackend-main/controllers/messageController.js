const Message = require("../models/message");

exports.getMessages = async (req, res) => {
    try {
        const { userId, receiverId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: "Error fetching messages" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        const newMessage = new Message({
            senderId,
            receiverId,
            content,
            timestamp: new Date()
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Error sending message" });
    }
};
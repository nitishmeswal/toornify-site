import { Chat } from "../models/chat.models.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { room, message, sender, senderId } = req.body;
    if (!room || !message) {
      return res.status(400).json({ message: "room and message required" });
    }
    const chatMessage = new Chat({ room, message, sender, senderId });
    await chatMessage.save();

    // Emit via socket if available
    const io = req.app.get("io");
    if (io) {
      io.to(room).emit("chat message", {
        _id: chatMessage._id,
        room: chatMessage.room,
        message: chatMessage.message,
        sender: chatMessage.sender,
        senderId: chatMessage.senderId,
        createdAt: chatMessage.createdAt,
      });
    }

    return res.status(201).json(chatMessage);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { room } = req.params;
    if (!room) return res.status(400).json({ message: "room param required" });
    const messages = await Chat.find({ room }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export default { sendMessage, getHistory };

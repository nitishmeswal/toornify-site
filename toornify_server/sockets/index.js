import { Chat } from "../models/chat.models.js";

export function initSockets(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("chat message", async (data) => {
      try {
        const chatMessage = new Chat({
          room: data.room,
          message: data.message,
          sender: data.sender || "Anonymous",
          senderId: data.senderId || null,
        });
        await chatMessage.save();
        io.to(data.room).emit("chat message", {
          _id: chatMessage._id,
          room: chatMessage.room,
          message: chatMessage.message,
          sender: chatMessage.sender,
          senderId: chatMessage.senderId,
          createdAt: chatMessage.createdAt,
        });
      } catch (error) {
        console.error("Error saving chat message:", error);
      }
    });

    socket.on("get history", async (room) => {
      try {
        const messages = await Chat.find({ room }).sort({ createdAt: 1 });
        socket.emit("chat history", messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

export default initSockets;

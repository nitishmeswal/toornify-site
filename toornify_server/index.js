// Load environment variables FIRST before any other imports
import "./config/env.js";

import { app } from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import initSockets from "./sockets/index.js";
import { connectDB } from "./db/index.js";


const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log("✅ Database connected, starting server...");

    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
    });

    app.set("io", io);

    // Initialize socket event handlers from dedicated module
    initSockets(io);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

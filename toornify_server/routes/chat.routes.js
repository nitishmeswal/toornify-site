import express from "express";
import { sendMessage, getHistory } from "../controllers/chat.controllers.js";

const router = express.Router();

router.post("/message", sendMessage);
router.get("/history/:room", getHistory);

export default router;

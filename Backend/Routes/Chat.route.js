import { Router } from "express";
import { protect } from "../Middleware/auth.js";
import {
  getChatToken,
  createConversation,
  getMyConversations
} from "../Controller/Chat.controller.js";

const router = Router();

router.get("/token", protect, getChatToken);
router.post("/conversation/:id", protect, createConversation);
router.get("/my-chats", protect, getMyConversations);

export default router;

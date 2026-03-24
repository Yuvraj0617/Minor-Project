import express from "express";
import { getNotifications } from "../Controller/Notification.controller.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.get("/", protect, getNotifications);

export default router;
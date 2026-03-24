import express from "express";
import {
  expressInterest
} from "../Controller/Application.controller.js";

import { 
  getApplicants,
  acceptApplication,
  rejectApplication
} from "../Controller/Request.controller.js";

import { protect } from "../Middleware/auth.js";

const router = express.Router();

router.post("/:projectId", protect, expressInterest);
router.get("/:projectId", protect, getApplicants);
router.patch("/accept/:id", protect, acceptApplication);
router.patch("/reject/:id", protect, rejectApplication);

export default router;
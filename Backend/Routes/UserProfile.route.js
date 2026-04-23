import { Router } from "express";
import {GetUserProfile,CreateUserProfile, UpdateUserProfile} from "../Controller/UserProfile.controller.js"
import { protect } from "../Middleware/auth.js";

const router = Router()

router.post('/', protect, CreateUserProfile)
router.patch('/', protect, UpdateUserProfile)
router.get('/me', protect, GetUserProfile)
router.get('/:userId',GetUserProfile)

export default router

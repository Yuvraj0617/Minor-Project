import { Router } from "express";
import {GetUserProfile,CreateUserProfile} from "../Controller/UserProfile.controller.js"

const router = Router()

router.post('/profile/:userId',CreateUserProfile)
router.get('/profile/:userId',GetUserProfile)

export default router
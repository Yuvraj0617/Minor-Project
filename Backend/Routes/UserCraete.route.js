import { Router } from "express";
import {CreateUser} from "../Controller/AuthUser.controller.js"
const router = Router()

router.post('/signup',CreateUser)

export default router
import { Router } from "express";
import {LoginUser} from "../Controller/AuthUser.controller.js"
const router=Router()

router.get('/login',LoginUser)

export default router
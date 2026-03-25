import {CreateProject, getProjects} from '../Controller/Project.controller.js';
import { protect } from "../Middleware/auth.js";
import { Router } from "express";
const router = Router()

router.post('/projects/:userId', protect, CreateProject)
router.get('/projects',  getProjects)


export default router
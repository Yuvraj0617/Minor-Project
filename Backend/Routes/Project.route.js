import {CreateProject} from '../Controller/Project.controller.js';
import { Router } from "express";
const router = Router()

router.post('/projects/:userId',CreateProject)


export default router
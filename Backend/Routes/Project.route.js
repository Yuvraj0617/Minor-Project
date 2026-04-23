import {CreateProject, getProjects, getMatchedProjects, getMatchedUsersForProject} from '../Controller/Project.controller.js';
import { protect } from "../Middleware/auth.js";
import { Router } from "express";
const router = Router()

router.get('/matches/me', protect, getMatchedProjects)
router.get('/:projectId/matches/users', protect, getMatchedUsersForProject)
router.post('/', protect, CreateProject)
router.get('/', getProjects)


export default router
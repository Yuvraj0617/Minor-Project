import {
	CreateProject,
	DeleteProject,
	UpdateProject,
	getProjects,
	getMatchedProjects,
	getMatchedUsersForProject,
} from '../Controller/Project.controller.js';
import { protect } from "../Middleware/auth.js";
import { Router } from "express";
const router = Router()

router.get('/matches/me', protect, getMatchedProjects)
router.get('/:projectId/matches/users', protect, getMatchedUsersForProject)
router.post('/', protect, CreateProject)
router.patch('/:projectId', protect, UpdateProject)
router.delete('/:projectId', protect, DeleteProject)
router.get('/', getProjects)


export default router
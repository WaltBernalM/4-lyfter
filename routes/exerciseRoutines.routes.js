// @ts-check

import { Router } from "express"
import { postNewExerciseRoutine } from "../controllers/exerciseRoutines.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post('/', isAuthenticated, postNewExerciseRoutine)

export default router

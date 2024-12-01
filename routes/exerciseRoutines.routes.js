// @ts-check

import { Router } from "express"
import { getExerciseRoutineById, getExerciseRoutines, postNewExerciseRoutine } from "../controllers/exerciseRoutines.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post('/', isAuthenticated, postNewExerciseRoutine)

router.get('/', isAuthenticated, getExerciseRoutines)

router.get('/:routineId', isAuthenticated, getExerciseRoutineById)

export default router

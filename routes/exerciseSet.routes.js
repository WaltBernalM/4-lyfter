// @ts-check

import { Router } from "express"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { getExerciseSetById, postNewExerciseSet } from "../controllers/exerciseSet.controller.js"

const router = Router()

router.post("/", isAuthenticated, postNewExerciseSet)

router.get('/:exerciseSetId', isAuthenticated, getExerciseSetById)

export default router

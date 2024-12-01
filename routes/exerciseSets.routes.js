import { Router } from "express"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { postNewExerciseSet } from "../controllers/exerciseSets.controller.js"

const router = Router()

router.post("/", isAuthenticated, postNewExerciseSet)

export default router

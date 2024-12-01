// @ts-check

import { Router } from "express"
import {
  getWorkoutById,
  getWorkouts,
  postNewWorkout,
} from "../controllers/workouts.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post("/", isAuthenticated, postNewWorkout)

router.get("/", isAuthenticated, getWorkouts)

router.get("/:workoutId", isAuthenticated, getWorkoutById)

export default router

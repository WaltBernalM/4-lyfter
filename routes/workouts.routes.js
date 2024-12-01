// @ts-check

import { Router } from "express"
import {
  getWorkoutById,
  getWorkouts,
  patchWorkout,
  postNewWorkout,
} from "../controllers/workouts.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post("/", isAuthenticated, postNewWorkout)

router.get("/", isAuthenticated, getWorkouts)

router.get("/:workoutId", isAuthenticated, getWorkoutById)

router.patch("/:workoutId", isAuthenticated, patchWorkout)

export default router

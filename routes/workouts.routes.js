// @ts-check

import { Router } from "express"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import {
  deleteWorkoutById,
  getWorkoutById,
  getWorkouts,
  patchWorkoutById,
  postNewWorkout,
} from "../controllers/workouts.controller.js"

const router = Router()

router.post("/", postNewWorkout)

router.get("/", getWorkouts)

router.get("/:workoutId", getWorkoutById)

router.patch("/:workoutId", patchWorkoutById)

router.delete("/:workoutId", deleteWorkoutById)

export default router

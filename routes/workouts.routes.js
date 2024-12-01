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

router.post("/", isAuthenticated, postNewWorkout)

router.get("/", isAuthenticated, getWorkouts)

router.get("/:workoutId", isAuthenticated, getWorkoutById)

router.patch("/:workoutId", isAuthenticated, patchWorkoutById)

router.delete("/:workoutId", isAuthenticated, deleteWorkoutById)

export default router

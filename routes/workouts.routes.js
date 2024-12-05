// @ts-check

import { Router } from "express"
import {
  deleteWorkoutById,
  getWorkoutById,
  getWorkouts,
  patchWorkoutById,
  postEstimateWorkoutGoal,
  postNewWorkout,
} from "../controllers/workouts.controller.js"

const router = Router()

router.post("/", postNewWorkout)

router.get("/", getWorkouts)

router.get("/:workoutId", getWorkoutById)

router.patch("/:workoutId", patchWorkoutById)

router.delete("/:workoutId", deleteWorkoutById)

router.post('/:workoutId', postEstimateWorkoutGoal)

export default router

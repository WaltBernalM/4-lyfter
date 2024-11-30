// @ts-check

import { Router } from "express"
import { getAllExercises } from "../controllers/exercises.controller.js"

const router = Router()

router.get("/", getAllExercises)

export default router
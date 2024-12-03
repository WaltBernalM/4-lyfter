// @ts-check

import { Router } from "express"
import { deleteExerciseSetById, getExerciseSetById, patchExerciseSetById, postNewExerciseSet } from "../controllers/exerciseSet.controller.js"

const router = Router()

router.post("/", postNewExerciseSet)

router.get('/:exerciseSetId', getExerciseSetById)

router.patch('/:exerciseSetId', patchExerciseSetById)

router.delete("/:exerciseSetId", deleteExerciseSetById)

export default router

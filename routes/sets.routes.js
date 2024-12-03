import { Router } from "express"
import { deleteSetbyId, getSetById, patchSetById, postNewSet } from "../controllers/sets.controller.js"

const router = Router()

router.post("/", postNewSet)

router.get("/:setId", getSetById)

router.patch("/:setId", patchSetById)

router.delete("/:setId", deleteSetbyId)

export default router

import { Router } from "express"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { getSetById, postNewSet } from "../controllers/sets.controller.js"

const router = Router()

router.post("/", isAuthenticated, postNewSet)

router.get("/:setId", isAuthenticated, getSetById)

export default router

// @ts-check

import { Router } from "express"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { patchUserUpdateController } from "../controllers/user.controller.js"

const router = Router()

router.patch("/", isAuthenticated, patchUserUpdateController)

export default router
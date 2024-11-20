// @ts-check

import { Router } from "express"
import {
  postSignupController,
  postLoginController,
  getVerifyController,
} from "../controllers/auth.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post("/signup", postSignupController)
router.post("/login", postLoginController)
router.get("/verify", isAuthenticated, getVerifyController)

export default router

// @ts-check

import { Router } from "express"
import { postCalculatorPaymentIntent } from "../controllers/payment.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"

const router = Router()

router.post("/intents/calculator", isAuthenticated, postCalculatorPaymentIntent)

export default router

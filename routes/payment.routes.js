// @ts-check

import { Router } from "express"
import { postCalculatorPaymentIntent } from "../controllers/payment.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { isAppPaid } from "../middleware/isAppPaid.js"

const router = Router()

router.post(
  "/intents/calculator",
  isAuthenticated,
  isAppPaid,
  postCalculatorPaymentIntent
)

export default router

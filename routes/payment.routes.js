// @ts-check

import { Router } from "express"
import {
  postCalculatorPaymentIntent,
  getCalculatorPaymentPrice,
} from "../controllers/payment.controller.js"
import { isAuthenticated } from "../middleware/jwt.middleware.js"
import { isAppPaid } from "../middleware/isAppPaid.js"

const router = Router()

router.post(
  "/intents/calculator",
  isAuthenticated,
  isAppPaid,
  postCalculatorPaymentIntent
)

router.get("/prices/calculator", getCalculatorPaymentPrice)

export default router

import { Router } from "express"
import paymentRoutes from "./payment.routes.js"

const router = Router()

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "Welcome to 4Lyfter" })
})

router.use("/payments", paymentRoutes)

export default router

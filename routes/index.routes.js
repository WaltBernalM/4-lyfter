import { Router } from "express"
import paymentRoutes from "./payment.routes.js"
import userRoutes from "./user.routes.js"

const router = Router()

router.get("/", (req, res, next) =>
  res.status(200).json({ message: "Welcome to 4Lyfter" })
)

router.use("/payments", paymentRoutes)

router.use("/users", userRoutes)

export default router

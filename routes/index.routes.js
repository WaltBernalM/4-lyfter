import { Router } from "express"
import paymentRoutes from "./payment.routes.js"
import userRoutes from "./user.routes.js"
import exercisesRoutes from './execises.routes.js'
import exerciseRoutinesRoutes from './exerciseRoutines.routes.js'

const router = Router()

router.get("/", (req, res, next) =>
  res.status(200).json({ message: "Welcome to 4Lyfter" })
)

router.use("/users", userRoutes)

router.use("/payments", paymentRoutes)

router.use('/exercises', exercisesRoutes)

router.use('/routines', exerciseRoutinesRoutes)

export default router

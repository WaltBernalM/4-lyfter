import { Router } from "express"
import paymentRoutes from "./payment.routes.js"
import userRoutes from "./user.routes.js"
import exerciseRoutes from './execises.routes.js'
import setRoutes from './sets.routes.js'
import workoutRoutes from './workouts.routes.js'
import exerciseSetRoutes from './exerciseSet.routes.js'

const router = Router()

router.get("/", (req, res, next) =>
  res.status(200).json({ message: "Welcome to 4Lyfter" })
)

router.use("/users", userRoutes)

router.use("/payments", paymentRoutes)

router.use("/workouts", workoutRoutes)

router.use('/exerciseSets', exerciseSetRoutes)

router.use('/exercises', exerciseRoutes)

router.use("/sets", setRoutes)

export default router

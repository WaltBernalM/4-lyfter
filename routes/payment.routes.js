import { Router } from 'express'
import { postPaymentIntent } from '../controllers/payment.controller.js'
import { isAuthenticated } from '../middleware/jwt.middleware.js'

const router = Router()

router.post('/intent', isAuthenticated, postPaymentIntent)

export default router
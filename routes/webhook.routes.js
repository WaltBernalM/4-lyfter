// @ts-check

import express from "express"
import { handleWebhook } from "../controllers/webhook.controller.js"

const router = express.Router()

router.post('/', express.raw({ type: 'application/json' }), handleWebhook)

export default router

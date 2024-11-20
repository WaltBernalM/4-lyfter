// @ts-check

import Stripe from "stripe"
import { getLyfterUserFromLyfterUserId, updateLyfterUserPaymentStatus } from "../services/user.service.js"

export const handleWebhook = async (req, res) => {
  const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY))
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET)

  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    const lyfterUserId = paymentIntent.metadata.lyfterUserId

    try {
      const lyfterUserInDb = await getLyfterUserFromLyfterUserId(lyfterUserId)

      if (!lyfterUserInDb) {
        console.log(`LyfterUser with id ${lyfterUserId} not found.`)
        return
      }

      await updateLyfterUserPaymentStatus(lyfterUserId, true)
      console.log(`LyfterUser ${lyfterUserId}'s payment status updated to paid.`)
    } catch (err) {
      console.error("Error updating payment status:", err)
      return res.status(500).send({ message: 'Error updating payment status'})
    }
  }

  res.json({ received: true })
}

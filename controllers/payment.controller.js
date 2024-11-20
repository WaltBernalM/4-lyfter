// @ts-check

import Stripe from "stripe"
import LyfterUser from "../models/LyfterUser.model.js"

export const postPaymentIntent = async (req, res, next) => {
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY)
  const stripe = new Stripe(stripeSecretKey)

  const { amount, currency, lyfterUserId } = req.body

  if (!amount || !currency || !lyfterUserId) {
    res.status(400).json({ message: "Missing fields (amount, currency, lyfterUserId)." })
  }

  const lyfterUserInDb = LyfterUser.findById(lyfterUserId)
  if (!lyfterUserInDb) {
    res.status(404).json({ message: `Failed payment intent, lyfter user not valid: ${lyfterUserId}` })
    return
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      metadata: { lyfterUserId }
    })

    res.send({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (e) {
    res.status(500).send({ message: "Error at payment intent", error: e.message })
  }
}

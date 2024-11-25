// @ts-check

import Stripe from "stripe"
import LyfterUser from "../models/LyfterUser.model.js"

export const postCalculatorPaymentIntent = async (req, res, next) => {
  const stripeSecretKey =
    process.env.NODE_ENV == "production"
      ? String(process.env.STRIPE_SECRET_KEY)
      : String(process.env.STRIPE_TEST_SECRET_KEY)

  const stripe = new Stripe(stripeSecretKey)

  try {
    const lyfterUserId = req.payload.userData.id
    if (!lyfterUserId) {
      return res
        .status(400)
        .json({ message: "Missing user data from the token." })
    }

    const lyfterUserInDb = LyfterUser.findById(lyfterUserId)
    if (!lyfterUserInDb) {
      return res
        .status(404)
        .json({
          message: `Failed payment intent, lyfter user not valid: ${lyfterUserId}`,
        })
    }

    const productId = String(process.env.STRIPE_CALCULATOR_ID)

    const priceList = await stripe.prices.list({
      product: productId,
      active: true,
    })
    if (!priceList.data.length) {
      return res
        .status(404)
        .json({ message: `No active prices found for product: ${productId}` })
    }

    const price = priceList.data[0]
    const amount = price.unit_amount
    if (typeof amount !== "number") {
      return res
        .status(500)
        .json({ message: "Price unit_amount is not valid." })
    }
    const currency = price.currency

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      metadata: { lyfterUserId, productId },
    })

    return res.send({ clientSecret: paymentIntent.client_secret })
  } catch (e) {
    console.error("Error creating payment intent:", e)
    return res
      .status(500)
      .send({ message: "Error at payment intent", error: e.message })
  }
}


export const getCalculatorPaymentPrice = async (req, res, next) => {
  const stripeSecretKey =
    process.env.NODE_ENV == "production"
      ? String(process.env.STRIPE_SECRET_KEY)
      : String(process.env.STRIPE_TEST_SECRET_KEY)

  const stripe = new Stripe(stripeSecretKey)

  try {
    const productId = String(process.env.STRIPE_CALCULATOR_ID)
    const productList = await stripe.products.list({ ids: [productId] })
    const priceList = await stripe.prices.list({ product: productId, active: true })

    const priceData = priceList.data[0]
    const productData = productList.data[0]

    const productBody = {
      name: productData["name"],
      description: productData["description"],
      currency: priceData["currency"],
      amount: (Number(priceData["unit_amount"]) / 100).toFixed(2)
    }

    res.status(200).json(productBody)
  } catch (e) {
    console.error("Error consulting calculator price:", e)
    return res
      .status(500)
      .send({ message: "Error at price consulting", error: e.message })
  }
}
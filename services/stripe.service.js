import Stripe from "stripe"

const getStripeKey = () => {
  return process.env.STRIPE_ENV == "production"
    ? String(process.env.STRIPE_SECRET_KEY)
    : String(process.env.STRIPE_TEST_SECRET_KEY)
}

export const getStripeObject = () => {
  const stripeSecretKey = getStripeKey()
  return new Stripe(stripeSecretKey)
}

const createCustomer = async (email) => {
  const stripe = getStripeObject()
  const customer = await stripe.customers.create({
    email: email,
  })
  return customer.id
}

const createInvoiceItem = async (customerId) => {
  const stripe = getStripeObject()

  const productId = process.env.NODE_ENV === 'production'
    ? String(process.env.STRIPE_PROD_CALCULATOR_ID)
    : String(process.env.STRIPE_TEST_CALCULATOR_ID)
  const productList = await stripe.products.list({ ids: [productId] })
  const product = productList.data[0]

  const priceList = await stripe.prices.list({ product: productId, active: true })
  const price = priceList.data[0]
  
  await stripe.invoiceItems.create({
        customer: customerId,
        amount: price.amount,
        currency: price.currency,
        description: product.description,
    })
}

const createAndSendInvoice = async (customerId) => {
  const stripe = getStripeObject()

  const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
  })

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
  return finalizedInvoice.hosted_invoice_url
}

export const sendInvoiceFlow = async (email, amount, currency, description) => {
  try {
    const customerId = await createCustomer(email)
    await createInvoiceItem(customerId, amount, currency, description)
    const invoiceUrl = await createAndSendInvoice(customerId)
    console.log(`Invoice sent! View at: ${invoiceUrl}`)
  } catch (error) {
    console.error("Error creating invoice:", error.message)
  }
}
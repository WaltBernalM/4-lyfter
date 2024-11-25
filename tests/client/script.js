
const stripe = Stripe(
  'pk_test_51QLWVc09Wlnf5fV371hZjLSjlqeZBhd3aGSpherVn7BbfUfdS2X9M3WReBYrLBpEFFQVRROnuxjBjR0EImTZxUuw00vOVdxEAX'
)

const elements = stripe.elements()
const cardElement = elements.create('card') // Create a Stripe Elements card input
cardElement.mount('#card-element') // Mount card input to the DOM

// Display card errors
cardElement.on('change', (event) => {
  const displayError = document.getElementById('card-errors')
  if (event.error) {
    displayError.textContent = event.error.message
  } else {
    displayError.textContent = ''
  }
})

// Login functionality
document.getElementById('loginButton').addEventListener('click', async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const loginResponse = await fetch('http://localhost:5005/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password }),
  })

  const loginData = await loginResponse.json()

  if (loginResponse.ok) {
    alert("Login successful!")
    document.getElementById('payButton').disabled = false // Enable Pay button after login
  } else {
    alert(`Login failed: ${loginData.message}`)
  }
})

// Payment functionality
document.getElementById('payButton').addEventListener('click', async () => {
  const response = await fetch('http://localhost:5005/api/payments/intents/calculator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  const paymentIntent = await response.json()

  if (paymentIntent.clientSecret) {
    const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    )

    if (error) {
      console.error("Error confirming payment: ", error.message)
      document.getElementById('card-errors').textContent = error.message
    } else if (confirmedPaymentIntent.status === 'succeeded') {
      alert("Payment successful!")
    }
  } else {
    alert("Payment intent creation failed.")
  }
});

import dotenv from "dotenv"
dotenv.config()

import "./db/index.js"

import express from "express"

const app = express()

import config from "./config/index.js"
config(app)

import webhookRoutes from "./routes/webhook.routes.js"
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

import indexRoutes from "./routes/index.routes.js"
app.use("/api", express.json(), indexRoutes)

import authRoutes from "./routes/auth.routes.js"
app.use("/auth", express.json(), authRoutes)

app.get("/", (req, res) => { res.json({ message: "Welcome to Four Lyfter Server!" }) })

import errorHandling from "./error-handling/index.js"
errorHandling(app)

export default app

// TODO: Create a view where user can input the session goal (bench, dead or squat) and the app generates the progression sets so as provides the option to try a 1mr
// TODO: Save the history of that session
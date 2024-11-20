// @ts-check

import dotenv from "dotenv"
dotenv.config()

import "./db/index.js"

import express from "express"

const app = express()

import config from "./config/index.js"
config(app)

import indexRoutes from "./routes/index.routes.js"
app.use("/api", indexRoutes)

import authRoutes from "./routes/auth.routes.js"
app.use("/auth", authRoutes)

import errorHandling from "./error-handling/index.js"
errorHandling(app)

export default app

import express from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:3000"

export default (app) => {
  app.set('trust proxy', 1)

  app.use(
    cors({
      origin: [FRONTEND_URL],
      credentials: true,
      methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      allowedHeaders: 'Content-Type, Authorization'
    })
  )

  app.use(logger('dev'))

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
}

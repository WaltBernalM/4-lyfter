// @ts-check

import { expressjwt as jwt } from "express-jwt"

const getTokenFromCookies = (req) => req.cookies.authToken || null

export const isAuthenticated = (req, res, next) => {
  const token = getTokenFromCookies(req)

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Missing authToken cookie" })
    return
  }

  const secret= String(process.env.SECRET_KEY)
  jwt({
    secret: secret,
    algorithms: ["HS256"],
    requestProperty: "payload",
    getToken: getTokenFromCookies,
  })(req, res, (error) => {
    if (error) {
      res.status(401).json({ message: "Unauthorized: Invalid authentication Token" })
      return
    }
    next()
  })
}

// @ts-check

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import LyfterUser from "../models/LyfterUser.model.js"

export const postSignupController = async (req, res, next) => {
  try {
    const { firstName, lastName, password, email, deviceFingerprint } = req.body

    if (!firstName || !lastName || !email || !password || !deviceFingerprint) {
      res.status(400)
        .json({
          message:
            "All fields required (firstName, lastName, email, password, deviceFingerprint)",
        })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Email format invalid" })
      return
    }

    // const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
    // if (!passwordRegex.test(password)) {
    //   res.status(400).json({
    //     message: `The password is as weak as Yamcha.
    //   Must have at least 6 chars, must use uppercased,
    //   and lowercased letters and have at least a number`,
    //   })
    //   return
    // }

    if (
      !String(email).endsWith("hotmail.com") &&
      !String(email).endsWith("gmail.com") &&
      !String(email).endsWith("outlook.com") &&
      !String(email).endsWith(".com.mx")
    ) {
      res.status(400).json({
        message: "Please enter a valid email address.",
      })
      return
    }

    const lyfterUserInDb = await LyfterUser.findOne({ email })
    if (lyfterUserInDb) {
      res.status(400).json({ message: "Lyfter User already registered." })
      return
    }

    const salt = bcrypt.genSaltSync(12)
    const hashPassword = bcrypt.hashSync(password, salt)
    const newLyfterUser = await LyfterUser.create({
      email,
      password: hashPassword,
      firstName,
      lastName,
      deviceFingerprint,
    })

    const {
      id: id,
      email: savedEmail,
      firstName: savedFirstName,
      lastName: savedLastName,
      isAppPaid: savedIsAppPaid,
    } = newLyfterUser

    res.status(201).json({
      user: {
        id,
        email: savedEmail,
        firstName: savedFirstName,
        lastName: savedLastName,
        isAppPaid: savedIsAppPaid,
      },
    })
  } catch (e) {
    res.status(500).json({ message: "Error at signup", error: e.message })
  }
}

export const postLoginController = async (req, res, next) => {
  try {
    const { password, email } = req.body

    if (!email || !password) {
      res.status(400).json({ message: "all fields required (password & email)" })
      return
    }

    const lyfterUserInDB = await LyfterUser.findOne({ email })
    if (!lyfterUserInDB) {
      res.status(401).json({ message: "Lyfter User not found" })
      return
    }

    const isPasswordCorrect = bcrypt.compareSync(password, lyfterUserInDB.password)
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Password not valid" })
      return
    }

    const userData = {
      id: lyfterUserInDB._id,
      email: lyfterUserInDB.email,
      firstName: lyfterUserInDB.firstName,
      lastName: lyfterUserInDB.lastName,
      isAppPaid: lyfterUserInDB.isAppPaid,
    }

    const secret = String(process.env.SECRET_KEY)
    const authToken = jwt.sign(
      { userData }, // payload
      secret, // secret key
      { algorithm: "HS256", expiresIn: "1h" }
    )

    res.cookie("authToken", authToken, {
      httpOnly: true,
      maxAge: 36000000,
      secure: true, //process.env.NODE_ENV === "production",
      sameSite: 'none' //process.env.NODE_ENV === "production" ? "none" : "lax",
    }).json({ message: "Lyfter account login successfully", user: userData })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const getVerifyController = async (req, res, next) => {
  try {
    res.status(200).json(req.payload)
  } catch (e) {
    res.status(500).json({ message: "Error at verification", error: e.message })
  }
}

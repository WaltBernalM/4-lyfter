// @ts-check

import bcrypt from "bcryptjs"
import LyfterUser from "../models/LyfterUser.model.js"

export const patchUserUpdateController = async (req, res, next) => {
  const { firstName, lastName, password } = req.body

  const lyfterUserId = req.payload.userData._id
  if (!lyfterUserId) {
    return res.status(400).json({ message: "Missing user data from token" })
  }

  const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
  if (!lyfterUserInDb) {
    return res.status(401).json({ message: "Lyfter User not found" })
  }

  let hashPassword = lyfterUserInDb.password
  if (password) {
    if (typeof password !== "string") {
      return res.status(400).json({ message: "Invalid password data type" })
    }

    const salt = bcrypt.genSaltSync(12)
    hashPassword = bcrypt.hashSync(password, salt)
  }

  try {
    lyfterUserInDb.firstName = firstName ?? lyfterUserInDb.firstName
    lyfterUserInDb.lastName = lastName ?? lyfterUserInDb.lastName
    lyfterUserInDb.password = hashPassword

    let updatedUserLyfter = await lyfterUserInDb.save()

    const lyfterUserInDB = await LyfterUser.findOne({
      email: updatedUserLyfter.firstName,
    })
      .select(["-password", "-personalInfo"])
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets",
          populate: [
            { path: "exercise" },
            { path: 'sets'}
          ]
        }
      })

    res
      .status(200)
      .json({ message: "User updated successfully", userData: lyfterUserInDB })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// @ts-check

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import LyfterUser from "../models/LyfterUser.model.js"
import ExerciseSet from "../models/ExerciseSet.model.js"
import Workout from "../models/Workout.model.js"
import Exercise from "../models/Exercise.model.js"

export const postSignupController = async (req, res, next) => {
  try {
    const { firstName, lastName, password, email, deviceFingerprint } = req.body

    if (!firstName || !lastName || !email || !password || !deviceFingerprint) {
      return res
        .status(400)
        .json({ message: "All fields required (firstName, lastName, email, password, deviceFingerprint)" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Email format invalid" })
      return
    }

    // const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
    // if (!passwordRegex.test(password)) {
    //   return res.status(400).json({
    //     message: `The password is too weak.
    //     Must have at least 6 chars, must use uppercased,
    //     and lowercased letters and have at least a number`,
    //   })
    // }

    if (
      !String(email).endsWith("hotmail.com") &&
      !String(email).endsWith("gmail.com") &&
      !String(email).endsWith("outlook.com") &&
      !String(email).endsWith(".com.mx")
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      })
    }

    const lyfterUserInDb = await LyfterUser.findOne({ email })
    if (lyfterUserInDb) {
      return res
        .status(409)
        .json({ message: "Lyfter User already registered." })
    }

    const deviceFingerprintInDb = await LyfterUser.findOne({ deviceFingerprint })
    if (deviceFingerprintInDb) {
      return res
        .status(409)
        .json({ message: 'duplicated device fingerprint' })
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

    await createBasicWorkoutsAtSignup(newLyfterUser._id)

    const lyfterUserInDB = await LyfterUser.findById(newLyfterUser._id)
      .select(["-password", "-personalInfo"])
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets",
          populate: [{ path: "exercise" }, { path: "sets" }],
        },
      })
    if (!lyfterUserInDB) {
      return res.status(404).json({ message: 'something went wrong, user not created' })
    }

    res.status(201).json({
      userData: lyfterUserInDB,
    })
  } catch (e) {
    console.error(`Error at signup: ${e.message}`)
    res.status(500).json({ message: "Error at signup", error: e.message })
  }
}

export const postLoginController = async (req, res, next) => {
  try {
    const { password, email } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "all fields required (password & email)" })
    }

    const lyfterUserInDB = await LyfterUser.findOne({ email })
      .select(["-deviceFingerprint", "-personalInfo"])
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets",
          populate: [
            { path: "exercise" },
            { path: 'sets'}
          ]
        },
      })

    if (!lyfterUserInDB) {
      return res.status(401).json({ message: "Lyfter User not found" })
    }

    const isPasswordCorrect = bcrypt.compareSync(
      password,
      lyfterUserInDB.password
    )

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Email or Password not valid" })
    }

    const userData = {
      _id: lyfterUserInDB._id,
      email: lyfterUserInDB.email,
      firstName: lyfterUserInDB.firstName,
      lastName: lyfterUserInDB.lastName,
      isAppPaid: lyfterUserInDB.isAppPaid,
      createdAt: lyfterUserInDB.createdAt,
      updatedAt: lyfterUserInDB.updatedAt,
    }

    const secret = String(process.env.SECRET_KEY)
    const authToken = jwt.sign(
      { userData }, // payload
      secret, // secret key
      { algorithm: "HS256", expiresIn: "1h" }
    )

    res
      .cookie("authToken", authToken, {
        httpOnly: true,
        maxAge: 36000000,
        secure: true, //process.env.NODE_ENV === "production",
        sameSite: "none", //process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({ message: "Lyfter account login successfully", userData })
  } catch (error) {
    console.error(`Error at login: ${error.message}`)
    res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

export const getVerifyController = async (req, res, next) => {
  try {
    // const { payload: { userData: { email } } } = req

    // const lyfterUserInDB = await LyfterUser.findOne({ email })
    //   .select(["-password", "-deviceFingerprint", "-personalInfo"])
    //   .populate({
    //     path: "exerciseRoutines",
    //     populate: {
    //       path: "exerciseSets",
    //       populate: [{ path: "exercise" }],
    //     },
    //   })

    // req.payload.userData = lyfterUserInDB
    res.status(200).json(req.payload)
  } catch (e) {
    console.error(`Error at verify: ${e.message}`)
    res.status(500).json({ message: "Error at verification", error: e.message })
  }
}


const createBasicWorkoutsAtSignup = async (lyfterUserId) => {
  try {
    await createBasicWorkout(1, 'Squat Day', lyfterUserId, 'barbell squat')

    await createBasicWorkout(2, "Deadlift Day", lyfterUserId, "barbell deadlift")

    await createBasicWorkout(3, 'Bench Press Day', lyfterUserId, 'barbell bench press - medium grip')

  } catch (error) {
    console.log(`error at creating basic workouts: ${error.message}`)
    throw new Error(error.message)
  }
}

const createBasicWorkout = async (workoutOrder, workoutTitle, lyfterUserId, exerciseName) => {
  const exercise = await Exercise.findOne({ name: { $regex: exerciseName, $options: "i" } })
  if (!exercise) {
    throw new Error(`Couldn't find ${exerciseName}`)
  }

  const workout = await Workout.create({ order: workoutOrder, title: workoutTitle })
  if (!workout) {
    throw new Error(`Couldn't create basic workout ${workoutTitle}`)
  }

  const updatedLyfterUser = await LyfterUser.findByIdAndUpdate(
    lyfterUserId,
    { $push: { workouts: workout._id } },
    { new: true }
  )
  if (!updatedLyfterUser) {
    throw new Error(`User ${lyfterUserId} not updated`)
  }

  const exerciseSet = await (await ExerciseSet.create({ order: 1, exercise: exercise._id })).populate([
      { path: 'exercise' },
      { path: 'sets' }
    ])
  if (!exerciseSet) {
    throw new Error(`Couldn't create basic exerciseSet`)
  }

  const updatedWorkout = await Workout.findByIdAndUpdate(
    workout._id,
    { $push: { exerciseSets: exerciseSet._id } },
    { new: true }
  )
  if (!updatedWorkout) {
    throw new Error(`Couldn't update existing workout: ${workout._id}`)
  }
}
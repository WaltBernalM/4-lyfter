// @ts-check

import Exercise from "../models/Exercise.model.js"
import ExerciseSet from "../models/ExerciseSet.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"

export const postExerciseSet = async (req, res, next) => {
  const { intensity, series, reps, exerciseId } = req.body

  if (!intensity || !reps || !series || !exerciseId) {
    return res
      .status(400)
      .json({ message: "series, reps, intensity are required" })
  }

  const lyfterUserId = req.payload.userData.id
  if (!lyfterUserId) {
    return res
      .status(401)
      .json({ message: "Missing user data from the token." })
  }

  const lyfterUserInDb = LyfterUser.findById(lyfterUserId)
  if (!lyfterUserInDb) {
    return res.status(404).json({
      message: `Failed payment intent, lyfter user not valid: ${lyfterUserId}`,
    })
  }

  const errorBody = validateSetInfo(intensity, series, reps)
  if (errorBody) {
    return res
      .status(400)
      .json(errorBody)
  }

  const exerciseInDB = await Exercise.findById(exerciseId)
  if (!exerciseInDB) {
    res.status(404).json({ message: "exerciseId not found in DB" })
    return
  }

  const newExerciseSet = await (await ExerciseSet.create({
    intensity,
    series,
    reps,
    exercise: exerciseId
  }))
}

const validateSetInfo = (intensity, series, reps) => {
  if (series < 1 || series > 20 || series % 1 !== 0) {
    return { message: "reps must be a integer number between 1 and 20" }
  }
  if (reps < 1 || (reps > 300 && reps % 1 !== 0)) {
    return { message: "reps must be a integer number between 1 and 300" }
  }
  if (intensity < 0.3 || intensity > 1) {
    return { message: "intensity must be between 0.3 and 1" }
  }
  return null
}
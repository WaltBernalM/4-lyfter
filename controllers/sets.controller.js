// @ts-check

import Set from "../models/Set.model.js"
import ExerciseSet from "../models/ExerciseSet.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"

export const postNewSet = async (req, res, next) => {
  try {
    const { order, weight, units, intensity, series, reps, exerciseSetId } = req.body

    if (!order || !weight || !units || !series || !reps || !intensity || !exerciseSetId) {
      return res.status(400).json({
        message: "order, weight, intensity, resiers and reps are required",
      })
    }

    const lyfterUserId = req.payload.userData._id

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId).populate({
      path: 'workouts',
      populate: {
        path: 'exerciseSets',
        populate: { path:'sets' }
      }
    })
    if (!lyfterUserInDb) {
      return res.status(404).json({
        message: `User not valid: ${lyfterUserId}`,
      })
    }

    const isAssignedToUser = JSON.parse(JSON.stringify(lyfterUserInDb))
      .workouts.some(workout => workout.exerciseSets.some(exerciseSet => exerciseSet._id === exerciseSetId))
    console.log("isAssignedToUser", isAssignedToUser)
    if (!isAssignedToUser) {
      console.warn(`User ${lyfterUserId} tried to access/modify another user information`)
      return res.status(403).json({ message: 'Access Forbidden' })
    }

    const errorBody = validateSetInfo(weight, intensity, series, reps)
    if (errorBody) {
      return res.status(400).json(errorBody)
    }

    const exerciseSetInDb = await ExerciseSet.findById(exerciseSetId)
      .populate('sets')
    if (!exerciseSetInDb) {
      return res.status(404).json({ message: "exerciseSetId not found in DB" })
    }

    const notUniqueOrder = JSON.parse(JSON.stringify(exerciseSetInDb))
      .sets.some((set) => set.order === order)
    if (notUniqueOrder) {
      return res.status(400).json({
        message: `A set with order ${order} already exists in this ExerciseSet`,
      })
    }

    const newSet = await Set.create({ order, weight, units, intensity, series, reps })

    await ExerciseSet.findByIdAndUpdate(
      exerciseSetId,
      { $push: { sets: newSet._id } },
      { new: true }
    )

    return res.status(200).json({ set: newSet })
  } catch (error) {
    console.log(`Failed to update exercise: \(error.message)`)
    res.status(500).json({
      message: "Failed to update exercise - Internal Server Error",
      error,
    })
  }
}

export const getSetById = async (req, res, next) => {
  try {
    const { setId } = req.params

    if (!setId || !mongoose.isValidObjectId(setId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing setId parameter" })
    }

    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId || !mongoose.isValidObjectId(lyfterUserId)) {
      return res
        .status(401)
        .json({ message: `User not valid: ${lyfterUserId}` })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId).populate({
      path: "workouts",
      populate: {
        path: "exerciseSets",
        model: "ExerciseSet",
      },
    })
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: "User not found" })
    }

    const isSetAssignedToUser = JSON.parse(JSON.stringify(lyfterUserInDb))
      .workouts.some((workout) =>
          workout.exerciseSets.some(
          (exerciseSet) => exerciseSet.sets.some(set => set === setId)
        )
      )
    if (!isSetAssignedToUser) {
      console.warn(`User ${lyfterUserId} tried to access/modify another user information`)
      return res
        .status(403)
        .json({ message: "Access Forbidden" })
    }

    const setInDb = await Set.findById(setId)
    if (!setInDb) {
      return res.status(404).json({ message: "Set not found in database" })
    }

    res.status(200).json({ set: setInDb })
  } catch (error) {
    console.error("Error in getExerciseSetById:", error)
    res.status(500).json({
      message: "Internal Server Error in fetching exercise set",
      error: error.message,
    })
  }
}

const validateSetInfo = (weight, intensity, series, reps) => {
  if (weight <= 0 || weight >= 999) {
    return { message: 'weight must be greater than 0 and less than 999' }
  }
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
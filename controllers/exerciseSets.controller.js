// @ts-check

import Exercise from "../models/Exercise.model.js"
import ExerciseRoutine from "../models/ExerciseRoutine.model.js"
import ExerciseSet from "../models/ExerciseSet.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"

export const postNewExerciseSet = async (req, res, next) => {
  try {
    const { intensity, series, reps, exerciseId, routineId } = req.body

    if (!intensity || !reps || !series || !exerciseId || !routineId) {
      return res
        .status(400)
        .json({
          message:
            "series, reps, intensity, exerciseId and routineId are required",
        })
    }

    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId) {
      return res
        .status(401)
        .json({ message: "Missing user data from the token." })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
    if (!lyfterUserInDb) {
      return res
        .status(404)
        .json({
          message: `Failed payment intent, lyfter user not valid: ${lyfterUserId}`,
        })
    }

    const errorBody = validateSetInfo(intensity, series, reps)
    if (errorBody) {
      return res.status(400).json(errorBody)
    }

    const exerciseInDB = await Exercise.findById(exerciseId)
    if (!exerciseInDB) {
      return res.status(404).json({ message: "exerciseId not found in DB" })
    }

    const exerciseRoutineInDb = await ExerciseRoutine.findById(routineId)
    if (!exerciseRoutineInDb) {
      return res.status(404).json({ message: "routineId not found in DB" })
    }

    const routineInUser = await LyfterUser.findOne({
      exerciseRoutines: exerciseRoutineInDb._id,
    })
    if (!routineInUser) {
      return res.status(404).json({ message: "routineId not found in user" })
    }

    const newExerciseSet = await (
      await ExerciseSet.create({
        intensity,
        series,
        reps,
        exercise: exerciseId
      })
    )

    await ExerciseRoutine.findByIdAndUpdate(
      routineId,
      { $push: { exerciseSets: newExerciseSet._id } },
      { new: true }
    )

    const updatedUser = await LyfterUser.findById(lyfterUserId)
      .select(["-password", "-personalInfo"])
      .populate({
        path: "exerciseRoutines",
        populate: {
          path: "exerciseSets",
          populate: [{ path: "exercise" }]
        }
      })
    if (!updatedUser) {
      return res.status(404).json({ message: "user not updated" })
    }
    
    const clonedUpdatedLyfterUser = JSON.parse(JSON.stringify(updatedUser))
    const updatedExerciseRoutines = clonedUpdatedLyfterUser.exerciseRoutines.sort((a, b) => a.order - b.order)

    res.status(201).json({ exerciseRoutines: updatedExerciseRoutines })
  } catch (error) {
    console.log(`Failed to update exercise: \(error.message)`)
    res.status(500).json({ message: "Failed to update exercise - Internal Server Error", error })
  }
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
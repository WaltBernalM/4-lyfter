// @ts-check

import Exercise from "../models/Exercise.model.js"
import ExerciseSet from "../models/ExerciseSet.model.js"
import ExerciseRoutine from "../models/ExerciseRoutine.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"

export const postNewExerciseRoutine = async (req, res, next) => {
  try {
    const lyfterUserId = req.payload.userData.id
    if (!lyfterUserId) {
      return res
        .status(401)
        .json({ message: "Missing user data from the token." })
    }

    const { title, order } = req.body
    if (!title || !order) {
      return res
        .status(400)
        .json({ message: "order and title are required fields" })
    }
    if (order < 1 || order % 1 !== 0) {
      return res
        .status(400)
        .json({ message: "day must be an integer" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId).populate('exerciseRoutines')
    if (!lyfterUserInDb) {
      return res
        .status(404)
        .json({ message: `Failed payment intent, lyfter user not valid: ${lyfterUserId}` })
    }

    const { exerciseRoutines } = lyfterUserInDb
    let orderTaken = false
    if (exerciseRoutines.length > 0) {
      exerciseRoutines.forEach((exerciseRoutine) => {
        if (exerciseRoutine['order'] === order) {
          orderTaken = true
          return
        }
      })
    }
    if (orderTaken) {
      return res
        .status(400)
        .json({ message: "An exercise routine with this order value already exists" })
    }

    const newExerciseRoutine = await ExerciseRoutine.create({ title, order })
    const updatedLyfterUser = await LyfterUser.findByIdAndUpdate(
      lyfterUserId,
      { $push: { exerciseRoutines: newExerciseRoutine._id } },
      { new: true }
    )
      .select("-password")
      .populate({
        path: "exerciseRoutines",
        populate: {
          path: "exerciseSets",
          populate: [{ path: "exercise" }],
        }
      })

    const clonedUpdatedLyfterUser = JSON.parse(JSON.stringify(updatedLyfterUser))
    clonedUpdatedLyfterUser.exerciseRoutines.sort((a, b) => a.order - b.order)

    res
      .status(201)
      .json({ updatedExercisePlan: clonedUpdatedLyfterUser.exerciseRoutines })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .json({ message: "Model error", error })
    }
    res
      .status(500)
      .json({ message: "postNewExerciseRoutine - Internal Server Error", error: error.message })
  }
}
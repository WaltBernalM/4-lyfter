// @ts-check

import ExerciseRoutine from "../models/ExerciseRoutine.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"

export const postNewExerciseRoutine = async (req, res, next) => {
  try {
    const lyfterUserId = req.payload.userData._id
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
        .json({ message: `No user found` })
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
      .json({ exerciseRoutines: clonedUpdatedLyfterUser.exerciseRoutines })
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

export const getExerciseRoutines = async (req, res, next) => {
  try {
    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId) {
      return res
        .status(401)
        .json({ message: "Missing user data from the token." })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
      .select(["-password", "-deviceFingerprint", "-personalInfo"])
      .populate({
        path: "exerciseRoutines",
        populate: {
          path: "exerciseSets",
          populate: { path: "exercise" }
        }
      })
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: `No user found` })
    }

    const clonedUpdatedLyfterUser = JSON.parse(JSON.stringify(lyfterUserInDb))
    const sortedExerciseRoutines = clonedUpdatedLyfterUser.exerciseRoutines.sort((a, b) => a.order - b.order)
    res.status(200).json({ exerciseRoutines: sortedExerciseRoutines })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Exercise routine - Internal Server Error", error })
  }
}

export const getExerciseRoutineById = async (req, res, next) => {
  try {
    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId) {
      return res
        .status(401)
        .json({ message: "Missing user data from the token." })
    }

    const { routineId } = req.params
    if (!routineId) {
      return res.status(400).json({ message: "routineId is a required parameter" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: `No user found` })
    }
    if (!lyfterUserInDb.exerciseRoutines.includes(routineId)) {
      return res
        .status(403)
        .json({ message: "This routine is not associated with the user." })
    }

    const exerciseRoutineInDb = await ExerciseRoutine.findById(
      routineId
    ).populate({
      path: "exerciseSets",
      populate: {
        path: "exercise",
      }
    })

    if (!exerciseRoutineInDb) {
      return res.status(404).json({ message: "routine not found in database" })
    }

    res.status(200).json({ exerciseRoutine: exerciseRoutineInDb })
  } catch (error) {
    res.status(500).json({ message: "Exercise routine - Internal Server Error", error })
  }
}
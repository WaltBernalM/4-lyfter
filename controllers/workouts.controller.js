// @ts-check

import LyfterUser from "../models/LyfterUser.model.js"
import mongoose from "mongoose"
import Workout from "../models/Workout.model.js"

export const postNewWorkout = async (req, res, next) => {
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
      return res.status(400).json({ message: "day must be an integer" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId).populate(
      "workouts"
    )
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: `No user found` })
    }

    const { workouts } = lyfterUserInDb
    let orderTaken = false
    if (workouts.length > 0) {
      workouts.forEach((workout) => {
        if (workout["order"] === order) {
          orderTaken = true
          return
        }
      })
    }
    if (orderTaken) {
      return res
        .status(400)
        .json({
          message: "A workout with this order value already exists",
        })
    }

    const newWorkout = await Workout.create({ title, order })
    const updatedLyfterUser = await LyfterUser.findByIdAndUpdate(
      lyfterUserId,
      { $push: { workouts: newWorkout._id } },
      { new: true }
    )
      .select("-password")
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets",
          populate: [
            { path: "exercise" },
            { path: 'sets' }
          ],
        },
      })

    const clonedUpdatedLyfterUser = JSON.parse(
      JSON.stringify(updatedLyfterUser)
    )
    clonedUpdatedLyfterUser.workouts.sort((a, b) => a.order - b.order)

    res
      .status(201)
      .json({ workouts: clonedUpdatedLyfterUser.workouts })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: "Model error", error })
    }
    res
      .status(500)
      .json({
        message: "postNewWorkout - Internal Server Error",
        error: error.message,
      })
  }
}

export const getWorkouts = async (req, res, next) => {
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
        path: "workouts",
        populate: {
          path: "exerciseSets",
          populate: [
            { path: "exercise" },
            { path: 'sets' }
          ]
        }
      })
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: `No user found` })
    }

    const clonedUpdatedLyfterUser = JSON.parse(JSON.stringify(lyfterUserInDb))
    const sortedWorkouts = clonedUpdatedLyfterUser.workouts.sort((a, b) => a.order - b.order)
    res.status(200).json({ workouts: sortedWorkouts })
  } catch (error) {
    res
      .status(500)
      .json({ message: "getWorkouts - Internal Server Error", error })
  }
}

export const getWorkoutById = async (req, res, next) => {
  try {
    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId) {
      return res
        .status(401)
        .json({ message: "Missing user data from the token." })
    }

    const { workoutId } = req.params
    if (!workoutId) {
      return res
        .status(400)
        .json({ message: "workoutId is a required parameter" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: `No user found` })
    }

    const userWorkouts = JSON.parse(JSON.stringify(lyfterUserInDb)).workouts
    if (!userWorkouts.includes(workoutId)) {
      console.warn(`User ${lyfterUserId} tried to access/modify another user information`)
      return res
        .status(403)
        .json({ message: "Access Forbidden" })
    }

    const workoutInDb = await Workout.findById(
      workoutId
    ).populate({
      path: "exerciseSets",
      populate: [
        { path: "exercise" },
        { path: 'sets' }
      ]
    })

    if (!workoutInDb) {
      return res.status(404).json({ message: "workout not found in database" })
    }

    res.status(200).json({ workout: workoutInDb })
  } catch (error) {
    res
      .status(500)
      .json({ message: "getWorkoutById - Internal Server Error", error: error.message })
  }
}

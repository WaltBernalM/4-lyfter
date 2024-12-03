// @ts-check

import mongoose from "mongoose"
import Set from '../models/Set.model.js'
import ExerciseSet from "../models/ExerciseSet.model.js"
import LyfterUser from "../models/LyfterUser.model.js"
import Workout from "../models/Workout.model.js"
import Exercise from "../models/Exercise.model.js"

export const postNewExerciseSet = async (req, res) => {
  try {
    const { order, workoutId, exerciseId } = req.body

    if (!order || !workoutId || !exerciseId) {
      return res
        .status(400)
        .json({ message: "order, workoutId and exerciseId are required properties" })
    }

    const lyfterUserId = req.payload.userData._id

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
      .populate({
        path: 'workouts',
        populate: {
          path: 'exerciseSets'
        }
      })
    if (!lyfterUserInDb) {
      return res.status(404).json({
        message: `User not valid: ${lyfterUserId}`,
      })
    }

    const isAssignedToUser = JSON.parse(JSON.stringify(lyfterUserInDb)).workouts.some((workout) =>
      workout._id === workoutId
    )
    if (!isAssignedToUser) {
      console.warn(`User ${lyfterUserId} tried to access/modify another user information`)
      return res.status(403).json({ message: 'Access Forbidden' })
    }

    const workoutInDb = await Workout.findById(workoutId).populate({
      path: 'exerciseSets',
      model: 'ExerciseSet'
    })
    if (!workoutInDb) {
      return res.status(404).json({ message: "workoutId not found in database" })
    }

    const exerciseInDb = await Exercise.findById(exerciseId)
    if (!exerciseInDb) {
      return res.status(404).json({ message: 'exerciseId not found in databse' })
    }

    const isOrderUnique = !JSON.parse(JSON.stringify(workoutInDb)).exerciseSets
      .some((exerciseSet) => exerciseSet.order === order)
    if (!isOrderUnique) {
      return res.status(400).json({
        message: `A set with order ${order} already exists in this ExerciseSet`,
      })
    }

    const newExerciseSet = await (await ExerciseSet.create({ order, exercise: exerciseId })).populate([
      { path: 'exercise' },
      { path: 'sets' }
    ])

    await Workout.findByIdAndUpdate(
      workoutId,
      { $push: { exerciseSets: newExerciseSet._id } },
      { new: true }
    )

    res.status(200).json({ exerciseSet: newExerciseSet })
  } catch (error) {
    res.status(500).json({ message: 'postNewExerciseSet - Internal Server Error', error: error.message })
  }
}

export const getExerciseSetById = async (req, res) => {
  try {
    const { exerciseSetId } = req.params

    const lyfterUserId = req.payload.userData._id

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
      .select(["-password", "-personalInfo"])
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets",
        }
      })
    if (!lyfterUserInDb) {
      return res.status(404).json({
        message: `User not valid: ${lyfterUserId}`,
      })
    }

    const isAssignedToUser = JSON.parse(JSON.stringify(lyfterUserInDb))
      .workouts.some(workout => workout.exerciseSets.some(exerciseSet => exerciseSet._id === exerciseSetId))
    if (!isAssignedToUser) {
      console.warn(`User ${lyfterUserId} tried to access/modify another user information`)
      return res.status(403).json({ message: "Access Forbidden" })
    }

    const exerciseSetInDb = await ExerciseSet.findById(exerciseSetId)
      .populate([
        { path: 'exercise' },
        { path: 'sets' }
      ])
    if (!exerciseSetInDb) {
      return res
        .status(404)
        .json({ message: "exerciseSetId not found in databse" })
    }

    res.status(200).json({ exerciseSet: exerciseSetInDb })
  } catch (error) {
    console.error(`getExerciseSetById: ${error.message}`)
    res.status(500).json({ message: 'getExerciseSetById - Internal Server Error', error: error.message })
  }
}

export const patchExerciseSetById = async (req, res) => {
  try {
    const lyfterUserId = req.payload.userData._id
    if (!lyfterUserId) {
      return res
        .status(404)
        .json({ message: "Missing user data from the token" })
    }

    const { exerciseSetId } = req.params
    if (!exerciseSetId) {
      return res.status(404).json({ message: "exerciseSetId is a required parameter" })
    }

    const { order } = req.body
    if (!order) {
      return res
        .status(404)
        .json({ message: "order is a required property" })
    }

    if (order && (order < 1 || order % 1 !== 0)) {
      return res
        .status(400)
        .json({ message: "order must be a positive integer" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId)
      .populate({
        path: "workouts",
        populate: {
          path: "exerciseSets"
        }
      })
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: "User not found" })
    }

    const relatedWorkout = lyfterUserInDb.workouts.find((workout) => {
      return workout['exerciseSets'].some(
        (exerciseSet) => exerciseSet._id.toString() === exerciseSetId
      )
    })
    if (!relatedWorkout) {
      return res.status(404).json({ message: 'related Workout not found' })
    }

    const targetExerciseSet = relatedWorkout['exerciseSets']
      .find(exerciseSet => exerciseSet._id.toString() === exerciseSetId)
    if (!targetExerciseSet) {
      return res.status(404).json({ message: 'target exercise set not found' })
    }

    const conflictExerciseSet = relatedWorkout['exerciseSets'].find(exerciseSet => 
      exerciseSet['order'] === order && exerciseSet._id.toString() !== exerciseSetId
    )
    if (conflictExerciseSet) {
      await ExerciseSet.findByIdAndUpdate(
        conflictExerciseSet._id,
        { order: targetExerciseSet["order"] },
        { new: true }
      )
    }

    const updatedExerciseSet = await ExerciseSet.findByIdAndUpdate(
      exerciseSetId,
      {
        order
      },
      { new: true }
    ).populate([
      { path: 'exercise' },
      { path: 'sets'}
    ])
    if (!updatedExerciseSet) {
      return res.status(404).json({ message: "Workout update failed" })
    }

    res.status(200).json({ exerciseSet: updatedExerciseSet })
  } catch (error) {
    console.error(`patchExerciseSetById: ${error.message}`)

    res.status(500).json({ message: 'patchExerciseSetById - Internal Server error' })
  }
}

export const deleteExerciseSetById = async (req, res) => {
  try {
    const lyfterUserId = req.payload.userData._id

    if (!lyfterUserId) {
      return res
        .status(404)
        .json({ message: "Missing user data from the token" })
    }

    const { exerciseSetId } = req.params
    if (!exerciseSetId) {
      return res
        .status(404)
        .json({ message: "exerciseSetId is a required parameter" })
    }

    const lyfterUserInDb = await LyfterUser.findById(lyfterUserId).populate({
      path: "workouts",
      populate: {
        path: 'exerciseSets',
        populate: [
          { path: 'exercise' },
          { path: 'sets' }
        ]
      }
    })
    if (!lyfterUserInDb) {
      return res.status(404).json({ message: "User not found" })
    }

    const relatedWorkout = lyfterUserInDb.workouts.find((workout) => {
      return workout["exerciseSets"].some(
        (exerciseSet) => exerciseSet._id.toString() === exerciseSetId
      )
    })
    if (!relatedWorkout) {
      return res.status(404).json({ message: "related Workout not found" })
    }

    const exerciseSetToDelete = relatedWorkout['exerciseSets']
      .find(exerciseSet => exerciseSet._id.toString() === exerciseSetId)
    if (!exerciseSetToDelete) {
      return res.status(404).json({ message: "exerciseSetId not found" })
    }

    const setIdsToDelete = exerciseSetToDelete.sets.map(set => set._id)

    await Set.deleteMany({ _id: { $in: setIdsToDelete } })
    await Workout.findByIdAndUpdate(
      relatedWorkout._id,
      { $pull: { exerciseSets: exerciseSetId } },
      { new: true }
    )

    await ExerciseSet.findByIdAndDelete(exerciseSetId)

    return res.status(204).send()
  } catch (error) {
    console.error(`deleteExerciseSetById: ${error.message}`)

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: "Model error", error })
    }
    res.status(500).json({
      message: "deleteWorkout - Internal Server Error",
      error: error.message,
    })
  }
}
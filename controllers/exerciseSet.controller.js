// @ts-check

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
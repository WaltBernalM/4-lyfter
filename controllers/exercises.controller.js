// @ts-check

import Exercise from '../models/Exercise.model.js'
import { populateExerciseDb } from '../utils/seeds.utils.js'

export const getAllExercises = async (req, res, next) => {
  try {
    const { query } = req
    const { type, muscle, name } = query

    const types = [
      "cardio",
      "olympic_weightlifting",
      "plyometrics",
      "powerlifting",
      "strength",
      "stretching",
      "strongman",
    ]
    const muscles = [
      "abdominals",
      "abductors",
      "adductors",
      "biceps",
      "calves",
      "chest",
      "forearms",
      "glutes",
      "hamstrings",
      "lats",
      "lower_back",
      "middle_back",
      "neck",
      "quadriceps",
      "traps",
      "triceps",
    ]

    if (type && !types.includes(type)) {
      return res.status(400).json({ message: "Invalid 'type' query parameter" })
    }

    if (muscle && !muscles.includes(muscle)) {
      return res
        .status(400)
        .json({ message: "Invalid 'muscle' query parameter" })
    }

    let searchQuery = {}
    if (type) searchQuery.type = type
    if (muscle) searchQuery.muscle = muscle
    if (name) searchQuery.name = { $regex: name, $options: 'i' }

    let allExercises = await Exercise.find(searchQuery)
    if (allExercises.length === 0) {
      await populateExerciseDb()
      allExercises = await Exercise.find(searchQuery)
    }

    if (allExercises.length === 0) {
      return res.status(400).json({ message: "Search had no results."})
    }

    res.status(200).json({ allExercises })
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Exercises Controller: Internal Server Error",
        error: error.message,
      })
  }
}
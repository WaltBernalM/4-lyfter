// @ts-check

import Exercise from '../models/Exercise.model.js'
import mongoose from 'mongoose'
import { populateExerciseDb } from '../utils/seeds.utils.js'

export const getAllExercises = async (req, res, next) => {
  try {
    const { query } = req

    if (query) {
      const { type } = query
      const { muscle } = query
      const types = [
        "cardio",
        "omympic_weightlifting",
        "polymetrics",
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
        res.status(400).json({ message: "Invalid query parameter" })
        return
      } else if (muscle && !muscles.includes(muscle)) {
        res.status(400).json({ message: "Invalid query parameter" })
        return
      }
    }

    const allExercisesInDB = await Exercise.find()
    if (allExercisesInDB.length === 0) {
      await populateExerciseDb()
    }

    const allExercises = await Exercise.find(query)
    res
      .status(200)
      .json({ allExercises })
  } catch (error) {
    res.status(500).json({ message: "Exercises Controller: Internal Server Error", error: error.message })
  }
}

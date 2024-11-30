// @ts-check

import Exercise from "../models/Exercise.model.js"
const exercisesSeeds = await import("../db/seeds/exercises.json", { assert: { type: "json" } });

export const populateExerciseDb = async () => {

  if (process.env.NODE_ENV === "production") {
    console.log('Start to populate exercise in production environment')
  } else {
    console.log("Start to populate exercise in development environment")
  }

  await createExercises(exercisesSeeds)
}

const createExercises = async (exercises) => {
  if (exercises.length === 0) {
    console.error('Exercises is empty')
    return
  }

  for (const exercise of exercises) {
    const { name, type, muscle, equipment, instructions } = exercise
    const isCreated = await Exercise.findOne({ name })

    if (isCreated) {
      console.warn(`Exercise ${name} already exists`)
      continue
    }

    try {
      const createdExercise = await Exercise.create({
        name,
        type,
        muscle,
        equipment,
        instructions,
      })
      console.log(`Exercise ${createdExercise._id} created`)
    } catch (e) {
      console.warn("Failed to create exercise")
    }
  }
}

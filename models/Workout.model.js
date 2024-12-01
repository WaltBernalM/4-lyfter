// @ts-check

import { Schema, model } from "mongoose"

const workoutSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      required: [true, "Order must be a whole number"],
    },
    exerciseSets: [
      {
        type: Schema.Types.ObjectId,
        ref: "ExerciseSet",
      }
    ]
  },
  {
    timestamps: true,
  }
)

const Workout = model("Workout", workoutSchema)

export default Workout
// @ts-check

import { Schema, model } from "mongoose"

const exerciseRoutineSchema = new Schema(
  {
    title: {
      type: String,
      unique: true,
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

const ExerciseRoutine = model("ExerciseRoutine", exerciseRoutineSchema)

export default ExerciseRoutine
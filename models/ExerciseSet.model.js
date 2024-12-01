// @ts-check

import { Schema, model } from "mongoose"

const exerciseSetSchema = new Schema(
  {
    order: {
      type: Number,
      unique: true,
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, "is required"],
    },
    sets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Set"
      }
    ]
  },
  {
    timestamps: true,
  }
)

const ExerciseSet = model("ExerciseSet", exerciseSetSchema)

export default ExerciseSet

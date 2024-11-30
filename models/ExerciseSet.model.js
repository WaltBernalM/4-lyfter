// @ts-check

import { Schema, model } from "mongoose"

const exerciseSetSchema = new Schema(
  {
    intensity: {
      type: Number,
      required: [true, "intensity is a rqeuired property"],
    },
    series: {
      type: Number,
      required: [true, "series is a required property"],
      default: 5,
    },
    reps: {
      type: Number,
      required: [true, "reps is a required property"],
      default: 12,
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
    }
  },
  { timestamps: true }
)

const ExerciseSet = model("ExerciseSet", exerciseSetSchema)

export default ExerciseSet
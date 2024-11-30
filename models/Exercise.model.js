// @ts-check

import { Schema, model } from "mongoose"

const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    muscle: {
      type: String,
      trim: true,
    },
    equipment: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: false,
  }
)

const Exercise = model("Exercise", exerciseSchema)

export default Exercise

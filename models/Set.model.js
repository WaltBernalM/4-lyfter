// @ts-check

import { Schema, model } from "mongoose"

const setSchema = new Schema(
  {
    order: {
      type: Number,
      required: [true, "order is a required property"],
    },
    weight: {
      type: Number,
      required: [true, "weight is a required property"],
    },
    units: {
      type: String,
      enum: ["kg", "lb"],
      required: [true, "units is a required property (kg, lb)"],
      default: 'lb'
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
    intensity: {
      type: Number,
      required: [true, "intensity is a rqeuired property"],
      default: 0.85
    }
  },
  { timestamps: true }
)

const Set = model("Set", setSchema)

export default Set
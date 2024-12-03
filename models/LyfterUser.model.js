// @ts-check

import { Schema, model } from "mongoose"

const lyfterUserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First Name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required."],
      trim: true,
    },
    personalInfo: {
      type: Object,
      default: {
        age: null,
        height: null,
        weight: null,
        fatPercentage: null,
      },
    },
    deviceFingerprint: {
      type: String,
      required: [true, "Device fingerprint is required."],
      trim: true,
      unique: true,
    },
    isAppPaid: {
      type: Boolean,
      default: false,
    },
    workouts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workout",
      },
    ],
    standardMode: {
      type: Boolean,
      required: [true, "Standard Mode is required."],
      default: false
    },
    discCalibers: {
      type: [Number],
      enum: {
        values: [45, 35, 25, 20, 15, 10, 5, 2.5, 1.25],
        message: "Invalid disc caliber value. Allowed values are 45, 35, 25, 20, 15, 10, 5, 2.5, 1.25."
      },
      required: [true, "discCalibers is required"],
      default: [45, 25, 10, 5, 2.5]
    }
  },
  {
    timestamps: true,
  }
)

const LyfterUser = model("LyfterUser", lyfterUserSchema)

export default LyfterUser

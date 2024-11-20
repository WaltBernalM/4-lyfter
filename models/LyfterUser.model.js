import { Schema, model } from 'mongoose'

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const lyfterUserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      trim: true
    },
    firstName: {
      type: String,
      required: [true, 'First Name is required.'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required.'],
      trim: true
    },
    personalInfo: {
      type: Object,
      default: {
        age: null,
        height: null,
        weight: null,
        fatPercentage: null
      }
    },
    deviceFingerprint: {
      type: String,
      required: [true, 'Device fingerprint is required.'],
      unique: true
    },
    isAppPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
)

const LyfterUser = model("LyfterUser", lyfterUserSchema)

export default LyfterUser

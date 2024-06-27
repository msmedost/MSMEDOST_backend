import mongoose, { Schema } from "mongoose";


const atithiSchema = new Schema(
  {
    name: {
    type: String,
    required: true
  },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
    },
    state: {
        type: String,
    },
    pincode: {
        type: String,
    },
    businessCategory: {
        type: String,
    },
    city: {
        type: String,
    },
    userPhoto: {
        type: String,
    },
    introducerName: {
        type: String
    },
    introducerMobileNo: {
        type: String,
    }
  },
  { timestamps: true }
);

  
export const Atithi = mongoose.model("Atithi", atithiSchema);

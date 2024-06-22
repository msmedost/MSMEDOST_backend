import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
  {
    ourServiceCity: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    toliChapter: {
      type: String,
      required: true,
    },
    registerThroughReferenceNumber: {
      type: String,
    },
    yourReferenceNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    alternativePhoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    dateOfBirthDDMM: {
      type: String,
      required: true,
    },
    dateOfAnniversaryDDMM: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    stateUT: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalPinCode: {
      type: String,
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    businessCategory: {
      type: String,
      required: true,
    },
    businessDescription: {
      type: String,
      required: true,
    },
    officeAddress: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    googleMapLink: {
      type: String,
    },
    facebookLink: {
      type: String,
    },
    instagramLink: {
      type: String,
    },
    linkedinLink: {
      type: String,
    },
    twitterLink: {
      type: String,
    },
    leaderShip: {
      type: String,
    },
    committee: {
      type: String,
    },
    others: {
      type: String,
    },
    yearsInCurrentBusiness: {
      type: String,
    },
    currentBusinessSince: {
      type: String,
    },
    branchesIfAny: {
      type: String,
    },
    majorProductsServices: {
      type: String,
    },
    majorBrands: {
      type: String,
    },
    majorAchievements: {
      type: String,
    },
    majorClients: {
      type: String,
    },
    connectedWithAnyTradeBody: {
      type: String,
    },
    associatedwithanyBusinessSocialNetworkingGroups: {
      type: String,
    },
    userPhoto: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
    }
  },
  { timestamps: true }
);

  userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next;
    this.password = await bcrypt.hash(this.password, 10)
  })

  userSchema.methods.isPasswordCorrect = async function(){
    return await bcrypt.compare(password, this.password)
  }

  userSchema.methods.generateAccessToken = function(){
    jwt.sign(
      {
        _id: this._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
  }

export const User = mongoose.model("User", userSchema);




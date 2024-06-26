import { Atithi } from "../models/atithi.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const registerAtithi = asyncHandler(async (req, res) => {
    const {
      email,
      mobileNo
    } = req.body;
  
    if (
      [
        email,
        mobileNo
      ].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
  
    const existingUser = await Atithi.findOne({
      $or: [{ email }, { mobileNo }],
    });
  
    if (existingUser) {
      throw new ApiError(409, "You have already tried to become an atithi before with the same mobile no or email id");
    }
  
    let atithiPhotoLocalPath;
  
    if (
      req.files &&
      Array.isArray(req.files.atithiPhoto) &&
      req.files.atithiPhoto.length > 0
    ) {
      atithiPhotoLocalPath = req.files.atithiPhoto[0].path;
    }
  
    const atithiPhoto = await uploadOnCloudinary(atithiPhotoLocalPath);
  
   
  
    const user = await Atithi.create({
      ...req.body,
      atithiPhoto: atithiPhoto?.url || "",
    });
    const createdUser = await Atithi.findById(user._id);
  
    if (!createdUser) {
      throw new ApiError(500, "Internal Error");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "Atithi Registration Successful"));
  });

  export { registerAtithi }
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
      throw new ApiError(409, "You have previously attempted to register as a Atithi with the same mobile number or email address.");
    }
  
    let atithiPhotoLocalPath;
  
    if (
      req.files &&
      Array.isArray(req.files.userPhoto) &&
      req.files.userPhoto.length > 0
    ) {
      atithiPhotoLocalPath = req.files.userPhoto[0].path;
    }
  
    const userPhoto = await uploadOnCloudinary(atithiPhotoLocalPath);
  
   
  
    const user = await Atithi.create({
      ...req.body,
      userPhoto: userPhoto?.url || "",
    });
    const createdUser = await Atithi.findById(user._id);
  
    if (!createdUser) {
      throw new ApiError(500, "Internal Error");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "Atithi Registration Successful"));
  });



  const atithis = asyncHandler(async (req, res) => {
    try {
      const users = await Atithi.find();
      res.status(200).json(users); 
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  

  export { registerAtithi, atithis }
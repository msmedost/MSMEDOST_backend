import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const generateReferenceNumber = (phoneNumber) => {
  return phoneNumber + "1";
};

const generatePassword = (fullName, phoneNumber) => {
  fullName = fullName.trim();
  // const firstThreeLetters = fullName.slice(0, 3).charAt(0).toUpperCase() + fullName.slice(1, 3).toLowerCase();
  const firstThreeLetters =
    fullName.slice(0, 1).toUpperCase() + fullName.slice(1, 3).toLowerCase();
  const lastFourDigitPhoneNo = phoneNumber.slice(-4);
  const password = `${firstThreeLetters}@${lastFourDigitPhoneNo}`;
  return password;
};

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    await user.save({ validateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    // referenceNumber,
    emailAddress,
    fullName,
    phoneNumber,
    city,
    postalPinCode,
    organizationName,
    businessCategory,
    businessDescription,
    officeAddress,
  } = req.body;

  if (
    [
      // referenceNumber,
      emailAddress,
      fullName,
      phoneNumber,
      city,
      postalPinCode,
      organizationName,
      businessCategory,
      businessDescription,
      officeAddress,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // const existingRefNoOwner = await User.findOne({ referenceNumber });

  // if (!existingRefNoOwner) {
  //   throw new ApiError(400, "Please enter a valid Reference number");
  // }

  // const userName = existingRefNoOwner.fullName;

  // const successResponse = new ApiResponse(
  //   200,
  //   userName,
  //   "Reference number validated successfully"
  // );

  // res.status(200).json(successResponse);

  const existingUser = await User.findOne({
    $or: [{ emailAddress }, { phoneNumber }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Phone number already registered");
  }
  const userPhotoLocalPath = req.files?.userPhoto[0]?.path;


  let companyLogoLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.companyLogo) &&
    req.files.companyLogo.length > 0
  ) {
    companyLogoLocalPath = req.files.companyLogo[0].path;
  }

  if (!userPhotoLocalPath) {
    throw new ApiError(400, "Please upload your photo");
  }

  const userPhoto = await uploadOnCloudinary(userPhotoLocalPath);
  const companyLogo = await uploadOnCloudinary(companyLogoLocalPath);

  if (!userPhoto) {
    throw new ApiError(400, "Please upload your photo");
  }

  const generatedReferenceNumber = generateReferenceNumber(phoneNumber);
  const generatedPassword = generatePassword(fullName, phoneNumber);

  const user = await User.create({
    ...req.body,
    fullName,
    userPhoto: userPhoto.url,
    companyLogo: companyLogo?.url || "",
    emailAddress,
    password: generatedPassword,
    referenceNumber: generatedReferenceNumber,
  });
  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Internal Error");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Registration Successful"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { emailAddress, phoneNumber, password } = req.body;
  if (!emailAddress && !phoneNumber) {
    throw new ApiError(400, "Please Enter your Login Id");
  }

  const user = await User.findOne({
    $or: [{ emailAddress }, { phoneNumber }],
  });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken } = await generateToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password");

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

export { registerUser, loginUser };

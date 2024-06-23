import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const generateYourReferenceNumber = (phoneNumber) => {
  return phoneNumber + "1";
};

// const initializeDatabase = async () => {
//   try {
//     const existingUser = await User.findOne({ referenceNumber: "93311775951" });

//     if (!existingUser) {
//       await User.create({
//         ourServiceCity: "Kolkata",
//         zone: "North",
//         toliChapter: "Kolkata",
//         registerThroughReferenceNumber: "Not required",
//         yourReferenceNumber: "93311775951",
//         emailAddress: "support@msme.com",
//         password: "Not required",
//         fullName: "Not required",
//         phoneNumber: "Not required",
//         gender: "Not required",
//         bloodGroup: "Not required",
//         dateOfBirthDDMM: "Not required",
//         country: "Not required",
//         stateUT: "Not required",
//         city: "Not required",
//         postalPinCode: "Not required",
//         organizationName: "Not required",
//         businessCategory: "Not required",
//         businessDescription: "Not required",
//         officeAddress: "Not required",
//         userPhoto: "Not required",
//       });
//       console.log("Hardcoded reference number added successfully.");
//     }
//   } catch (error) {
//     throw new ApiError(400, "Date already exist")
//   }
// };

// initializeDatabase();

const generatePassword = (fullName, phoneNumber) => {
  fullName = fullName.trim();
  const firstThreeLetters = fullName.slice(0, 3).charAt(0).toUpperCase() + fullName.slice(1, 3).toLowerCase();
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
    emailAddress,
    fullName,
    phoneNumber,
    city,
    postalPinCode,
    organizationName,
    businessCategory,
    businessDescription,
    officeAddress,
    yourReferenceNumber
  } = req.body;

  if (
    [
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

  const existingRefNoOwner = await User.findOne({ yourReferenceNumber });

  if (!existingRefNoOwner) {
    throw new ApiError(400, "Please enter a valid Reference number");
  }

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

  const yourGeneratedReferenceNumber = generateYourReferenceNumber(phoneNumber);
  const generatedPassword = generatePassword(fullName, phoneNumber);

  const user = await User.create({
    ...req.body,
    fullName,
    userPhoto: userPhoto.url,
    companyLogo: companyLogo?.url || "",
    emailAddress,
    password: generatedPassword,
    yourReferenceNumber: yourGeneratedReferenceNumber,
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
  console.log("login:", req.body);
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



const allUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users); // Send the fetched users as JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


export { registerUser, loginUser, allUser }
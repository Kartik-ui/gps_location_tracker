import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateAccessAndRefreshTokens } from '../utils/generateTokens.js';

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized request');

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) throw new ApiError(401, 'Invalid Refresh Token');

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, 'Refresh Token has expired');
  }

  const newAccessToken = await user.generateAccessToken();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  };
  return res
    .status(200)
    .cookie('accessToken', newAccessToken, options)
    .json(new ApiResponse(200, {}, 'Access token refreshed successfully'));
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new ApiError(400, 'All fields are required');

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, 'Email Already Exists');

  await User.create({ name, email, password });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, 'All fields are required');

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const isPasswordCorrect = await user.isPasswordValid(password);

  if (!isPasswordCorrect) throw new ApiError(401, 'Invalid credentials');

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user);

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, 'User logged in successfully'));
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  };
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, email, password } = req.body;

  const updateFields = {};

  if (!name && !email && !password)
    throw new ApiError(400, 'At least one field is required');

  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (password) updateFields.password = password;

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
  }).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search = '',
    userType = 'all',
  } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const skip = (page - 1) * limit;

  let adminFilter = {};
  switch (userType.toLowerCase()) {
    case 'admin':
      adminFilter = { isAdmin: true };
      break;
    case 'regular':
      adminFilter = { isAdmin: false };
      break;
    default:
      adminFilter = {};
  }

  const searchQuery = search
    ? {
        $and: [
          adminFilter,
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      }
    : adminFilter;

  const users = await User.find(searchQuery)
    .limit(limit)
    .skip(skip)
    .sort(sort)
    .select('-password -refreshToken');

  const totalUser = await User.countDocuments(searchQuery);

  const userTypeString =
    userType === 'all' ? 'All' : userType === 'admin' ? 'Admin' : 'Regular';

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalUser,
        page,
        limit,
      },
      `${userTypeString} users fetched successfully`
    )
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);

  if (!user) throw new ApiError(404, 'User not found');

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'User deleted successfully'));
});

const toggleAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, 'Invalid user Id');

  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) throw new ApiError(404, 'User not found');

  user.isAdmin = !user.isAdmin;

  await user.save({ validateBeforeSave: false });

  const message = user.isAdmin
    ? 'Admin rights granted'
    : 'Admin rights revoked';

  return res.status(200).json(new ApiResponse(200, user, message));
});

export {
  deleteUser,
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  toggleAdmin,
  updateUser,
};

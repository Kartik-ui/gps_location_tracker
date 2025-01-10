import jwt from 'jsonwebtoken';
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
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find({})
    .limit(parseInt(limit))
    .skip(skip)
    .select('-password -refreshToken');

  const totalUser = await User.countDocuments({});

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalUser,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      'All users fetched successfully'
    )
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);

  if (!user) throw new ApiError(404, 'User not found');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'User deleted successfully'));
});

export {
  deleteUser,
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
};

import { isValidObjectId } from 'mongoose';
import { Location } from '../models/location.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const trackLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let { lat, lon } = req.body;

  if (!lat || !lon)
    throw new ApiError(400, 'Latitude and Longitude are required');

  lat = parseFloat(lat);
  lon = parseFloat(lon);

  const newLocation = await Location.create({
    user: userId,
    coordinates: [lat, lon],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newLocation, 'Location added successfully'));
});

const getLiveLocations = asyncHandler(async (req, res) => {
  const user = req.user;
  let { page = 1, limit = 2, sort = '-createdAt' } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const skip = (page - 1) * limit;

  const recentLocation = await Location.find({ user: user._id })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-user');

  if (!recentLocation) throw new ApiError(404, 'No location found');

  const totalLocations = await Location.countDocuments({ user: user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        location: recentLocation,
        totalLocations,
        page,
        limit,
      },
      'Latest location retrieved successfully'
    )
  );
});

const getUserLocationLogs = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log('userId:', userId);
  let { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  if (!isValidObjectId(userId)) throw new ApiError(400, 'Invalid user ID');

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select(
    '-password -refreshToken -isAdmin'
  );
  if (!user) throw new ApiError(404, 'User not found');

  const locationLogs = await Location.find({ user: userId })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('coordinates createdAt');

  const totalLogs = await Location.countDocuments({ user: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, locationLogs, totalLogs, page, limit },
        'Location logs retrieved successfully'
      )
    );
});

export { getLiveLocations, getUserLocationLogs, trackLocation };

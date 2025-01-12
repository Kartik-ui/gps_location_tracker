import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  handler: () => {
    throw new ApiError(
      429,
      'Too many requests from this IP, please try again in 15 minutes.'
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const locationLimiter = rateLimit({
  windowMs: 4 * 1000,
  max: 1,
  handler: () => {
    throw new ApiError(
      429,
      'Too many requests from this IP, please try again in 4 seconds.'
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

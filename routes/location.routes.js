import express from 'express';
import {
  getLiveLocations,
  getUserLocationLogs,
  trackLocation,
} from '../controllers/location.controller.js';
import { verifyAdmin, verifyJWT } from '../middlewares/auth.middleware.js';
import { locationLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post('/track', locationLimiter, verifyJWT, trackLocation);

// admin
router.get('/admin/locations', verifyJWT, verifyAdmin, getLiveLocations);

router.get('/admin/logs/:userId', verifyJWT, verifyAdmin, getUserLocationLogs);

export { router as locationRouter };

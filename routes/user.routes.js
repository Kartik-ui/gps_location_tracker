import express from 'express';
import {
  deleteUser,
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
} from '../controllers/user.controller.js';

import { verifyAdmin, verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/refresh-token', refreshAccessToken);

router.post('/login', loginUser);
router.get('/logout', verifyJWT, logoutUser);

router.post('/register', registerUser);
router.put('/update', verifyJWT, updateUser);

router.get('/', verifyJWT, verifyAdmin, getAllUsers);

router.delete('/:userId', verifyJWT, verifyAdmin, deleteUser);

export { router as userRouter };

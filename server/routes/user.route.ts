import express from 'express';
import {
  activateUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerHandler,
  socialAuth,
  updateAccessToken,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
} from '../controllers/user.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';

const userRouter = express.Router();

userRouter.post('/registration', registerHandler);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.get('/logout', isAuthenticated, logoutUser);

// TODO: Use this as middleware
// userRouter.get('/refresh-token', updateAccessToken);

userRouter.get('/me', isAuthenticated, getUserInfo);

userRouter.post('/social-auth', socialAuth);

userRouter.put('/update-user-info', isAuthenticated, updateUserInfo);

userRouter.put('/update-user-password', isAuthenticated, updateUserPassword);

userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture);

userRouter.get(
  '/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllUsers
);

export default userRouter;

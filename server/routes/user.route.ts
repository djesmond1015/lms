import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUserInfo,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
  updateUserRole,
} from '../controllers/user.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';

const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, getUserInfo);

userRouter.put('/me/user-name', isAuthenticated, updateUserInfo);

userRouter.put('/me/password', isAuthenticated, updateUserPassword);

userRouter.put('/me/profile-picture', isAuthenticated, updateProfilePicture);

userRouter.get(
  '/admin/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllUsers
);

userRouter.put(
  '/admin/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateUserRole
);

userRouter.delete(
  '/admin/users/:userId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  deleteUser
);

export default userRouter;

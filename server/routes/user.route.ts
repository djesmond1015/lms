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

userRouter.put('/update-user-info', isAuthenticated, updateUserInfo);

userRouter.put('/update-user-password', isAuthenticated, updateUserPassword);

userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture);

userRouter.get(
  '/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllUsers
);

userRouter.put(
  '/update-user-role',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateUserRole
);

userRouter.delete(
  '/delete-user/:userId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  deleteUser
);

export default userRouter;

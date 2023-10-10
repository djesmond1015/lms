import express from 'express';
import {
  activateUser,
  loginUser,
  logoutUser,
  registerHandler,
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';

const userRouter = express.Router();

userRouter.post('/registration', registerHandler);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.get('/logout', isAuthenticated, logoutUser);

export default userRouter;

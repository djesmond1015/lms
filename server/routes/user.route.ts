import express from 'express';
import {
  activateUser,
  loginUser,
  logoutUser,
  registerHandler,
} from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/registration', registerHandler);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login', loginUser);

userRouter.get('/logout', logoutUser);

export default userRouter;

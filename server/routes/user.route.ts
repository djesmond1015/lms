import express from 'express';
import { activateUser, registerHandler } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/registration', registerHandler);

userRouter.post('/activate-user', activateUser);

export default userRouter;

import express from 'express';
import { registerHandler } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/registration', registerHandler);

export default userRouter;

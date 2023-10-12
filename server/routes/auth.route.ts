import express from 'express';
import {
  activateUser,
  socialAuth,
  updateAccessToken,
  userSignIn,
  userSignOut,
  userSignUp,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth';

const authRouter = express.Router();

authRouter.post('/sign-up', userSignUp);

authRouter.post('/activation', activateUser);

authRouter.post('/sign-in', userSignIn);

authRouter.post('/Oauth', socialAuth);

// TODO: Use this as middleware
authRouter.get('/refresh-token', updateAccessToken);

authRouter.get('/sign-out', isAuthenticated, userSignOut);

export default authRouter;

require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import userModal, { IUser } from '../models/user.model';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import sendMail from '../utils/sendMail';
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from '../utils/jwt';
import userModel from '../models/user.model';
import { redis } from '../utils/redis';

// Register user
interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerHandler = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as IRegisterRequest;

      const isEmailExist = await userModal.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler('Email already exist', 400));
      }

      const user: IRegisterRequest = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = {
        user: {
          name: user.name,
        },
        activationCode,
      };

      try {
        await sendMail({
          email: user.email,
          subject: 'Activate your account',
          template: 'activation-mail.ejs',
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account!`,
          activationToken,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const createActivationToken = (user: any) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const activationToken = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: '5m',
    }
  );

  return { activationToken, activationCode };
};

// Activate User
interface IActivationRequest {
  activationToken: string;
  activationCode: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activationCode, activationToken } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activationToken,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activationCode) {
        return next(new ErrorHandler('Invalid Activation Code', 400));
      }

      const { name, email, password } = newUser.user;

      const existUser = await userModal.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler('Email already exist', 409));
      }

      const user = await userModal.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login user
interface ILoginUserRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginUserRequest;

      if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
      }

      const user = await userModel.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler('Invalid email or password', 400));
      }

      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Logout user
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_cookie', '', { maxAge: 1 });

      const userId = req.user?._id;

      redis.del(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = 'Could not refresh token';
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }

      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(
          new ErrorHandler('Please login to access this resource', 400)
        );
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: '5m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: '3d' }
      );

      req.user = user;

      res.cookie('access_token', accessToken, accessTokenOptions);
      res.cookie('refresh_token', refreshToken, refreshTokenOptions);

      await redis.set(
        user._id,
        JSON.stringify(user),
        'EX',
        604800
      ); /* 7 days */

      res.status(200).json({
        success: true,
        accessToken,
      });

      // TODO: Use this as middleware
      // next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// export const updateAccessToken = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const refresh_token = req.cookies.refresh_token as string;
//       const decoded = jwt.verify(
//         refresh_token,
//         process.env.REFRESH_TOKEN as string
//       ) as JwtPayload;

//       const message = 'Could not refresh token';
//       if (!decoded) {
//         return next(new ErrorHandler(message, 400));
//       }
//       const session = await redis.get(decoded.id as string);

//       if (!session) {
//         return next(
//           new ErrorHandler('Please login for access this resources!', 400)
//         );
//       }

//       const user = JSON.parse(session);

//       const accessToken = jwt.sign(
//         { id: user._id },
//         process.env.ACCESS_TOKEN as string,
//         {
//           expiresIn: '5m',
//         }
//       );

//       const refreshToken = jwt.sign(
//         { id: user._id },
//         process.env.REFRESH_TOKEN as string,
//         {
//           expiresIn: '3d',
//         }
//       );

//       req.user = user;

//       res.cookie('access_token', accessToken, accessTokenOptions);
//       res.cookie('refresh_token', refreshToken, refreshTokenOptions);

//       await redis.set(user._id, JSON.stringify(user), 'EX', 604800); // 7days

//       res.status(200).json({
//         success: true,
//         accessToken,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import { IOrder } from '../models/order.model';
import userModel from '../models/user.model';
import courseModel from '../models/course.model';
import sendMail from '../utils/sendMail';
import NotificationModel from '../models/notification.model';
import { newOrder } from '../services/order.service';

// TODO: Update the with payment_info
//  Create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body as IOrder;

      if (!courseId) {
        return next(new ErrorHandler('Missing required field', 400));
      }

      const userId = req.user?._id;

      const user = await userModel.findById(userId);

      const isCourseExist = user?.courses.find(
        (course: any) => course._id.toString() === courseId
      );

      if (isCourseExist) {
        return next(
          new ErrorHandler('You have already purchased this course', 409)
        );
      }

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }

      const data: any = {
        courseId: course._id,
        userId: userId,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      };

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: 'Order Confimation',
            template: 'order-confirmation.ejs',
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.courses.push(course?.id);

      //  TODO: Add to redis

      await user?.save();

      await NotificationModel.create({
        title: 'New Order',
        message: `You have a new order from ${course?.name}`,
        userId: user?.id,
      });

      course.purchased++;

      await course.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';
import NotificationModel, {
  NotificationStatus,
} from '../models/notification.model';
import cron from 'node-cron';

// Get all notifications -- admin
export const getAllNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update notification -- admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.notificationId;

      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        return next(new ErrorHandler('Notification not found', 404));
      }

      notification.status = NotificationStatus.READ;

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Delete notification --admin
cron.schedule('0 0 0 * * *', async () => {
  const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({
    createdAt: { $lt: thirtyDayAgo },
    status: NotificationStatus.READ,
  });

  console.log('Deleted read notifications');
});

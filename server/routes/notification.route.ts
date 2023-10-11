import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  getAllNotifications,
  updateNotification,
} from '../controllers/notification.controller';

const notificationRouter = express.Router();

notificationRouter.get(
  '/notifications',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllNotifications
);

notificationRouter.put(
  '/notifications/:notificationId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateNotification
);

export default notificationRouter;

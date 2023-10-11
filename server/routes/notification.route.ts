import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import { getAllNotifications } from '../controllers/notification.controller';

const notificationRouter = express.Router();

notificationRouter.get(
  '/notifications',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllNotifications
);

export default notificationRouter;

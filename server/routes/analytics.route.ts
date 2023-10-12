import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  getNotificationsAnalytics,
  getOrdersAnalytics,
  getUsersAnalytics,
} from '../controllers/analytics.controller';

const analyticsRouter = express.Router();

analyticsRouter.get(
  '/analytics/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getUsersAnalytics
);

analyticsRouter.get(
  '/analytics/orders',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getOrdersAnalytics
);

analyticsRouter.get(
  '/analytics/notifications',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getNotificationsAnalytics
);

export default analyticsRouter;

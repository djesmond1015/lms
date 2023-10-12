import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import { getUsersAnalytics } from '../controllers/analytics.controller';

const analyticsRouter = express.Router();

analyticsRouter.get(
  '/analytics/users',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getUsersAnalytics
);

export default analyticsRouter;

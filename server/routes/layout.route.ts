import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import { createLayout } from '../controllers/layout.controller';

const layoutRouter = express.Router();

layoutRouter.post(
  '/layout',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  createLayout
);

export default layoutRouter;

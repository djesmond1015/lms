import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  createLayout,
  editLayout,
  getLayoutByType,
} from '../controllers/layout.controller';

const layoutRouter = express.Router();

layoutRouter.post(
  '/users/admin/layout',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  createLayout
);

layoutRouter.put(
  '/users/admin/layout',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  editLayout
);

layoutRouter.get('/layout', getLayoutByType);

export default layoutRouter;

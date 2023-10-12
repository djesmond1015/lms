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
  '/layout',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  createLayout
);

layoutRouter.put(
  '/layout',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  editLayout
);

layoutRouter.get('/layout', getLayoutByType);

export default layoutRouter;

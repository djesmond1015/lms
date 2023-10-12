import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { createOrder, getAllOrders } from '../controllers/order.controller';
import { UserRoles } from '../models/user.model';

const orderRouter = express.Router();

orderRouter.post('/user/orders', isAuthenticated, createOrder);

orderRouter.get(
  '/admin/orders',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllOrders
);

export default orderRouter;

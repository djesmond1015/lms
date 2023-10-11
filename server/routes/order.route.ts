import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { createOrder, getAllOrders } from '../controllers/order.controller';
import { UserRoles } from '../models/user.model';

const orderRouter = express.Router();

orderRouter.post('/create-order', isAuthenticated, createOrder);

orderRouter.get(
  '/orders',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllOrders
);

export default orderRouter;

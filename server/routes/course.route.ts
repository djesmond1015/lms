import express from 'express';
import { createCourse } from '../services/course.service';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';

const courseRouter = express.Router();

courseRouter.post(
  '/create-course',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  createCourse
);

export default courseRouter;

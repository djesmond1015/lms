import express from 'express';
import { createCourse } from '../services/course.service';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  getSingleCourse,
  updateCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter.post(
  '/create-course',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  createCourse
);

courseRouter.put(
  '/update-course/:courseId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateCourse
);

courseRouter.get('/get-course/:courseId', getSingleCourse);

export default courseRouter;

import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  addQuestion,
  addQuestionReply,
  getCourseByUser,
  getCourses,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

// TODO: Test this api again
courseRouter.post(
  '/create-course',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  uploadCourse
);

courseRouter.put(
  '/update-course/:courseId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateCourse
);

courseRouter.get('/courses/:courseId', getSingleCourse);

courseRouter.get('/courses', getCourses);

courseRouter.get(
  '/courses/:courseId/content',
  isAuthenticated,
  getCourseByUser
);

courseRouter.put('/add-question', isAuthenticated, addQuestion);

courseRouter.put('/add-question-reply', isAuthenticated, addQuestionReply);

export default courseRouter;

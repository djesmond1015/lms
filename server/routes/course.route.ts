import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  addQuestion,
  addQuestionReply,
  addReview,
  addReviewReply,
  getAllCourses,
  getCourseByUser,
  getCourses,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

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

courseRouter.put('/review/:courseId', isAuthenticated, addReview);

courseRouter.put(
  '/review-reply',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  addReviewReply
);

courseRouter.get(
  '/courses',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllCourses
);

export default courseRouter;

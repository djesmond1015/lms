import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import { UserRoles } from '../models/user.model';
import {
  addQuestion,
  addQuestionReply,
  addReview,
  addReviewReply,
  deleteCourse,
  getAllCourses,
  getCourseByUser,
  getCourses,
  getSingleCourse,
  updateCourse,
  uploadCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter.post(
  '/users/admin/courses',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  uploadCourse
);

courseRouter.put(
  '/users/admin/courses/:courseId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  updateCourse
);

courseRouter.get('/courses', getCourses);

courseRouter.get('/courses/:courseId', getSingleCourse);

courseRouter.get(
  '/users/me/courses/:courseId',
  isAuthenticated,
  getCourseByUser
);

courseRouter.put('/users/me/courses/question', isAuthenticated, addQuestion);

courseRouter.put(
  '/users/me/courses/question-reply',
  isAuthenticated,
  addQuestionReply
);

courseRouter.put(
  '/users/me/courses/:courseId/review',
  isAuthenticated,
  addReview
);

courseRouter.put(
  '/users/admin/courses/course/review-reply',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  addReviewReply
);

courseRouter.get(
  '/users/admin/courses',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  getAllCourses
);

courseRouter.delete(
  '/users/admin/courses/:courseId',
  isAuthenticated,
  authorizeRoles(UserRoles.ADMIN),
  deleteCourse
);

export default courseRouter;

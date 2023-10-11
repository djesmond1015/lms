import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import cloudinary from 'cloudinary';
import { createCourse } from '../services/course.service';
import courseModel from '../models/course.model';
import { redis } from '../utils/redis';
import mongoose from 'mongoose';
import sendMail from '../utils/sendMail';
import NotificationModel from '../models/notification.model';

// Upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const uploadedThumbnail = await cloudinary.v2.uploader.upload(
          thumbnail,
          {
            folder: 'courses',
          }
        );

        data.thumbnail = {
          public_id: uploadedThumbnail.public_id,
          url: uploadedThumbnail.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update course
export const updateCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      const courseId = req.params.courseId;

      const courseData = (await courseModel.findById(courseId)) as any;

      // TODO: Need to modify a bit in the future
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

        const uploadedThumbnail = await cloudinary.v2.uploader.upload(
          thumbnail,
          {
            folder: 'thumbnail',
          }
        );

        data.thumbnail = {
          public_id: uploadedThumbnail.public_id,
          url: uploadedThumbnail.secure_url,
        };
      }

      const course = await courseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get single course -- without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId;

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const cacheCourse = JSON.parse(isCacheExist);

        console.log('cacheCourse', cacheCourse);

        res.status(200).json({
          success: true,
          cacheCourse,
        });
      } else {
        const course = await courseModel
          .findById(courseId)
          .select(
            '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links'
          );

        await redis.set(
          courseId,
          JSON.stringify(course),
          'EX',
          604800
        ); /* 7 days */

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get courses -- without purchasing
export const getCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await courseModel
        .find()
        .select(
          '-courseData.videoUrl -courseData.suggestion -courseData.links -courseData.questions'
        );

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.courseId;
      const userCourseList = req.user?.courses;

      const isCourseExist = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!isCourseExist) {
        return next(
          new ErrorHandler('You are not eligible to access this course', 404)
        );
      }

      const course = await courseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddQuestionBody {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId } = req.body as IAddQuestionBody;

      if (!question) {
        return next(new ErrorHandler('Question is required', 400));
      }

      if (!courseId) {
        return next(new ErrorHandler('Course ID is require', 400));
      }

      if (!contentId) {
        return next(new ErrorHandler('Content ID is required', 400));
      }

      const course = await courseModel.findById(courseId);

      if (contentId && !mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler('Invalid content ID', 400));
      }

      const courseContent = course?.courseData.find((content: any) =>
        content._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler('Invalid Content ID', 400));
      }

      // Create a new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // Add this question to the course content
      courseContent.questions.push(newQuestion);

      // Send notification to the course instructor
      await NotificationModel.create({
        userId: req.user?._id,
        title: 'New Question Received',
        message: `You have received a new question in ${courseContent.title}`,
      });

      // Save the updated course
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Add question reply in course question
interface IAddQuestionReplyBody {
  reply: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addQuestionReply = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply, courseId, contentId, questionId } =
        req.body as IAddQuestionReplyBody;

      if (!reply || !courseId || !contentId || !questionId) {
        return next(new ErrorHandler('Missing required fields', 400));
      }

      const course = await courseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler('Invalid content ID', 400));
      }

      const courseContent = course?.courseData.find((content: any) =>
        content._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler('Invalid content ID', 400));
      }

      const question = courseContent.questions.find((question: any) =>
        question._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler('Invalid question ID', 400));
      }

      // Create a new question reply object
      const newQuestionReply: any = {
        user: req.user,
        reply,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add this question reply to the course content
      question.questionReplies.push(newQuestionReply);

      await course?.save();

      if (req.user?._id === question.user._id) {
        // Send a notification to the question user
        await NotificationModel.create({
          user: req.user?._id,
          title: 'New Question Reply Received',
          message: `You have a new question reply in ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        try {
          await sendMail({
            email: question.user.email,
            subject: 'Question Reply',
            template: 'question-reply.ejs',
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Add review in course
interface IAddReviewBody {
  review: string;
  rating: number;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;

      const courseId = req.params.courseId;

      const isCourseExist = userCourseList?.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!isCourseExist) {
        return next(
          new ErrorHandler('You are not eligible to access this course', 404)
        );
      }

      const course = await courseModel.findById(courseId);

      const { rating, review } = req.body as IAddReviewBody;

      if (!rating || !review) {
        return next(new ErrorHandler('Missing required fields', 400));
      }

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course?.reviews.push(reviewData);

      const totalRating = course?.reviews.reduce((total, review) => {
        if (review.rating) {
          return total + review.rating;
        }
        return total;
      }, 0);

      if (course && totalRating !== undefined) {
        course.ratings = totalRating / course.reviews.length;
      }

      await course?.save();

      // TODO: Add to redis

      await NotificationModel.create({
        user: req.user?._id,
        title: 'New Review Received',
        message: `${req.user?.name} has given a review in ${course?.name}`,
      });

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Add reply in course review
interface IAddReviewReplyBody {
  reply: string;
  courseId: string;
  reviewId: string;
}

export const addReviewReply = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reply, courseId, reviewId } = req.body as IAddReviewReplyBody;

      if (!reply || !courseId || !reviewId) {
        return next(new ErrorHandler('Missing required fields', 400));
      }

      const course = await courseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }

      const review = course.reviews.find(
        (review: any) => review._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler('Review not found', 404));
      }

      const replyData: any = {
        user: req.user,
        reply,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      review.commentReplies.push(replyData);

      await course?.save();

      // TODO: Add to redis

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

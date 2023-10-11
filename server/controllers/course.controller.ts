import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import cloudinary from 'cloudinary';
import { createCourse } from '../services/course.service';
import courseModel from '../models/course.model';
import { redis } from '../utils/redis';
import { isCallChain } from 'typescript';

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

import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import cloudinary from 'cloudinary';
import { createCourse } from '../services/course.service';
import courseModel from '../models/course.model';

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

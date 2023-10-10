import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

import cloudinary from 'cloudinary';
import { createCourse } from '../services/course.service';

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
            folder: 'thumbnail',
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

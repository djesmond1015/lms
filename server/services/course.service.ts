import { NextFunction, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import courseModel from '../models/course.model';

// Create course
export const createCourse = CatchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const course = await courseModel.create(data);

    res.status(201).json({
      success: true,
      course,
    });
  }
);

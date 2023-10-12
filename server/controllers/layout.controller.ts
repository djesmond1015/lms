import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';
import layoutModel, { LayoutType } from '../models/layout.model';

import cloudinary from 'cloudinary';

// Create Layout
export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (!type) {
        return next(new ErrorHandler('Layout type is required', 400));
      }

      if (type && !(type in LayoutType)) {
        return next(new ErrorHandler('Invalid layout type', 400));
      }

      const isTypeExist = await layoutModel.findOne({ type });

      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exists`, 400));
      }

      if (type === LayoutType.BANNER) {
        const { image, title, subtitle } = req.body;

        if (!image || !title || !subtitle) {
          return next(
            new ErrorHandler(
              `Missing required ${LayoutType.BANNER} fields`,
              400
            )
          );
        }

        const uploadedBannerImage = await cloudinary.v2.uploader.upload(image, {
          folder: 'layout',
        });

        const banner = {
          type: LayoutType.BANNER,
          banner: {
            image: {
              public_id: uploadedBannerImage.public_id,
              url: uploadedBannerImage.secure_url,
            },
            title,
            subtitle,
          },
        };

        await layoutModel.create(banner);
      }

      if (type === LayoutType.FAQ) {
        const { faq } = req.body;

        if (!faq) {
          return next(
            new ErrorHandler(`Missing required ${LayoutType.FAQ}`, 400)
          );
        }

        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );

        await layoutModel.create({ type: LayoutType.FAQ, faqs: faqItems });
      }

      if (type === LayoutType.CATEGORY) {
        const { categories } = req.body;

        const categoryItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );

        await layoutModel.create({
          type: LayoutType.CATEGORY,
          categories: categoryItems,
        });
      }

      res.status(201).json({
        success: true,
        message: `${type} created successfully`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout -- Admin
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (!type) {
        return next(new ErrorHandler('Layout type is required', 400));
      }

      if (type && !(type in LayoutType)) {
        return next(new ErrorHandler('Invalid layout type', 400));
      }

      if (type === LayoutType.BANNER) {
        const { image, title, subtitle } = req.body;

        const bannerFromDatabase: any = await layoutModel.findOne({ type });

        // TODO: Need to modify a bit in the future

        if (!bannerFromDatabase) {
          return next(new ErrorHandler(`${type} not found`, 404));
        } else {
          await cloudinary.v2.uploader.destroy(
            bannerFromDatabase.banner.image.public_id
          );
        }

        const uploadedBannerImage = await cloudinary.v2.uploader.upload(image, {
          folder: 'layout',
        });

        const banner = {
          type: LayoutType.BANNER,
          image: {
            public_id: uploadedBannerImage.public_id,
            url: uploadedBannerImage.secure_url,
          },
          title,
          subtitle,
        };

        await layoutModel.findByIdAndUpdate(bannerFromDatabase?._id, {
          banner,
        });
      }

      if (type === LayoutType.FAQ) {
        const { faq } = req.body;

        const faqFromDatabase = await layoutModel.findOne({ type });

        if (!faqFromDatabase) {
          return next(new ErrorHandler(`${type} not found`, 404));
        }

        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );

        await layoutModel.findByIdAndUpdate(faqFromDatabase?._id, {
          type: LayoutType.FAQ,
          faqs: faqItems,
        });
      }

      if (type === LayoutType.CATEGORY) {
        const { categories } = req.body;

        const categoriesFromDatabase = await layoutModel.findOne({ type });

        if (!categoriesFromDatabase) {
          return next(new ErrorHandler(`${type} not found`, 404));
        }

        const categoryItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );

        await layoutModel.findByIdAndUpdate(categoriesFromDatabase?._id, {
          type: LayoutType.CATEGORY,
          categories: categoryItems,
        });
      }

      res.status(200).json({
        success: true,
        message: `${type} updated successfully`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

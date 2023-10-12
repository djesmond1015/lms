import mongoose, { Document, Model, Schema } from 'mongoose';

export enum LayoutType {
  BANNER = 'BANNER',
  FAQ = 'FAQ',
  CATEGORY = 'CATEGORY',
}

export interface IFaqItem extends Document {
  question: string;
  answer: string;
}

export interface ICategory extends Document {
  title: string;
}

export interface IBannerImage extends Document {
  public_id: string;
  url: string;
}

export interface ILayout extends Document {
  type: LayoutType;
  faqs: IFaqItem[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subtitle: string;
  };
}

const faqSchema = new Schema<IFaqItem>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categorySchema = new Schema<ICategory>({
  title: {
    type: String,
  },
});

const bannerImageSchema = new Schema<IBannerImage>({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});

const layoutSchema = new Schema<ILayout>({
  type: {
    type: String,
    enum: Object.values(LayoutType),
  },
  faqs: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
  },
});

const layoutModel: Model<ILayout> = mongoose.model('Layout', layoutSchema);

export default layoutModel;

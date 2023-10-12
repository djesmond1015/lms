import mongoose, { Document, Model, Schema } from 'mongoose';

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

export interface INotification extends Document {
  title: string;
  message: string;
  status: NotificationStatus;
  // userId: string;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: NotificationStatus.UNREAD,
    },
  },
  { timestamps: true }
);

const NotificationModel: Model<INotification> = mongoose.model(
  'Notification',
  notificationSchema
);

export default NotificationModel;

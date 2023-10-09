require('dotenv').config();
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export enum UserRole {
  user = 'USER',
  admin = 'ADMIN',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: UserRole;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      validate: {
        validator: function (v: string) {
          return emailRegexPattern.test(v);
        },
        message: 'Please enter a valid email',
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: UserRole.user,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

//  Hash Password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// TODO: Sign access token and sign refresh token

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModal: Model<IUser> = mongoose.model('User', userSchema);

export default userModal;

import { Response } from 'express';
import { redis } from '../utils/redis';
import userModel, { UserRoles } from '../models/user.model';

// Get user by id
export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);

    res.status(201).json({
      success: true,
      user,
    });
  }
};

// Get all users -- Admin
export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    users,
  });
};

// Update user role -- Admin
export const updateUserRoleService = async (
  userId: string,
  role: UserRoles,
  res: Response
) => {
  const user = await userModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  res.status(200).json({
    success: true,
    user,
  });
};

import { Service } from 'typedi';
import { IUser, UserModel } from '@/libs/db';
import { NotFoundError, BadRequestError, HttpError } from 'routing-controllers';
import { FilterQuery } from 'mongoose';

@Service()
export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const createdUser = new UserModel(userData);
      return await createdUser.save();
    } catch (error) {
      const err = error as { code?: number; keyValue?: object };
      if (err.code === 11000) {
        throw new HttpError(409, 'User already exists');
      }
      throw new BadRequestError('Error creating user.');
    }
  }

  async updateOne(
    filter: FilterQuery<IUser>,
    data: Partial<IUser>
  ): Promise<IUser> {
    const result = await UserModel.findOneAndUpdate(filter, data, {
      new: true
    }).exec();
    if (!result) {
      throw new NotFoundError(`User was not found to update it.`);
    }
    return result;
  }

  async findOne(filter: FilterQuery<IUser>): Promise<IUser> {
    const user = await UserModel.findOne(filter).lean().exec();
    if (!user) {
      throw new NotFoundError(`User was not found.`);
    }
    return user;
  }

  async findAll(): Promise<IUser[]> {
    return await UserModel.find().lean().exec();
  }

  async deleteOne(filter: FilterQuery<IUser>): Promise<void> {
    const result = await UserModel.findOneAndDelete(filter).exec();
    if (!result) {
      throw new NotFoundError(`User was not found to delete it.`);
    }
    return;
  }
}

import { UserRepository } from '@/modules/users/user.repository';
import { Action, UnauthorizedError } from 'routing-controllers';
import Container from 'typedi';
import { IUser } from '../db';

export async function userChecker(action: Action): Promise<IUser> {
  const userId = action.request.userId;
  if (!userId) {
    throw new Error('You are not logged in to do this');
  }

  const userRepository = Container.get(UserRepository);
  const user = await userRepository.findOne({ _id: userId });
  if (!user) {
    throw new UnauthorizedError('You are not logged in to do this');
  }
  return user;
}

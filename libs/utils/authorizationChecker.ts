import { AuthHelper } from '@/modules/auth/helpers/auth.helper';
import { Action, UnauthorizedError } from 'routing-controllers';
import Container from 'typedi';

export function authorizationChecker(action: Action): boolean {
  const authorizationHeader = action.request.headers.authorization as
    | string
    | undefined;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('You are not logged in to do this');
  }

  const token = authorizationHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('You are not logged in to do this');
  }

  const authHelper = Container.get(AuthHelper);
  const userId = authHelper.validateAndDecodeToken(token);

  if (!userId) {
    throw new UnauthorizedError('You are not logged in to do this');
  }
  action.request.userId = userId;
  return true;
}

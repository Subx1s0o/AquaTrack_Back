import { IUser } from '@/libs/db';

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

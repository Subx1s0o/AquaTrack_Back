import { Service } from 'typedi';
import { ISession, SessionModel } from '@/libs/db';
import { BadRequestError } from 'routing-controllers';

@Service()
class SessionService {
  constructor() {}

  async createSession(data: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
  }): Promise<ISession> {
    return await SessionModel.create(data);
  }

  async findSession(sessionId: string): Promise<ISession | null> {
    return await SessionModel.findOne({ _id: sessionId });
  }

  async deleteSession(sessionId: string): Promise<void> {
    const result = await SessionModel.findByIdAndDelete({ _id: sessionId });
    if (!result) {
      throw new BadRequestError('Unable to delete session');
    }
    return;
  }
}

export default SessionService;

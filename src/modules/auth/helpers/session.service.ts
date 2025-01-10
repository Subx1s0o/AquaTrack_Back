import { Service } from 'typedi';
import { ISession, SessionModel } from '@/libs/db';

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
    return await SessionModel.findOne({ sessionId });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await SessionModel.deleteOne({ sessionId });
  }
}

export default SessionService;

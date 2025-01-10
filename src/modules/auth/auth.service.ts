import { Service } from 'typedi';

import { RegisterDto } from './dto/register';
import { AuthHelper } from './helpers/auth.helper';
import { ISession, IUser } from '@/libs/db';
import { UnauthorizedError } from 'routing-controllers';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login';
import SessionService from './helpers/session.service';
import { Response } from 'express';
import { LifeTime } from '@/libs/global/constants';
import { UserRepository } from '../user.repository';
@Service()
class AuthService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService
  ) {}

  async register(
    res: Response,
    body: RegisterDto
  ): Promise<{ user: Omit<IUser, 'password'>; accessToken: string }> {
    const hashPassword = await bcrypt.hash(body.password, 10);
    const user = await this.userRepository.create({
      ...body,
      password: hashPassword
    });

    const tokens = this.generateAccessAndRefreshToken(user._id);

    const session = await this.sessionService.createSession({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    this.setupSession(res, session);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: JSON.parse(JSON.stringify(userWithoutPassword)),
      accessToken: tokens.accessToken
    };
  }

  async login(
    res: Response,
    body: LoginDto
  ): Promise<{ user: Omit<IUser, 'password'>; accessToken: string }> {
    const user = await this.userRepository.findOne({ email: body.email });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(body.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateAccessAndRefreshToken(user._id);

    const session = await this.sessionService.createSession({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + LifeTime.WEEK)
    });

    this.setupSession(res, session);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: JSON.parse(JSON.stringify(userWithoutPassword)),
      accessToken: tokens.accessToken
    };
  }

  async logout(sessionId: string): Promise<void> {
    return await this.sessionService.deleteSession(sessionId);
  }

  async refresh(
    res: Response,
    sessionId: string,
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    const session = await this.sessionService.findSession(sessionId);

    if (!session || session.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired');
    }

    await this.sessionService.deleteSession(sessionId);

    await this.sessionService.createSession({
      userId: session.userId,
      refreshToken,
      expiresAt: new Date(Date.now() + LifeTime.WEEK)
    });

    this.setupSession(res, session);

    const tokens = this.generateAccessAndRefreshToken(session.userId);

    return { accessToken: tokens.accessToken };
  }

  private generateAccessAndRefreshToken(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.authHelper.generateToken(
      userId,
      LifeTime.TOKEN_HOUR
    );
    const refreshToken = this.authHelper.generateToken(
      userId,
      LifeTime.TOKEN_WEEK
    );

    return { accessToken, refreshToken };
  }

  private setupSession(res: Response, session: ISession): void {
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + LifeTime.WEEK)
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + LifeTime.WEEK)
    });
  }
}

export default AuthService;

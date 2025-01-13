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
import { UserRepository } from '@/modules/users/user.repository';
import { GoogleHelper } from './helpers/google.helper';

@Service()
class AuthService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    private readonly googleHelper: GoogleHelper
  ) {}

  async register(
    res: Response,
    body: RegisterDto
  ): Promise<Omit<IUser, 'password'>> {
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

    this.setupResponseCookies(res, session, tokens.accessToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return JSON.parse(JSON.stringify(userWithoutPassword));
  }

  async login(res: Response, body: LoginDto): Promise<Omit<IUser, 'password'>> {
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

    this.setupResponseCookies(res, session, tokens.accessToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return JSON.parse(JSON.stringify(userWithoutPassword));
  }

  async logout(sessionId: string): Promise<void> {
    return await this.sessionService.deleteSession(sessionId);
  }

  async refresh(
    res: Response,
    sessionId: string,
    refreshToken: string
  ): Promise<void> {
    const session = await this.sessionService.findSession(sessionId);

    if (!session || session.refreshToken !== refreshToken) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      throw new UnauthorizedError('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      throw new UnauthorizedError('Session expired, please log in again');
    }

    await this.sessionService.deleteSession(sessionId);

    const newSession = await this.sessionService.createSession({
      userId: session.userId,
      refreshToken,
      expiresAt: new Date(Date.now() + LifeTime.WEEK)
    });

    const tokens = this.generateAccessAndRefreshToken(newSession.userId);

    this.setupResponseCookies(res, newSession, tokens.accessToken);

    return;
  }

  returnLink(): string {
    return this.googleHelper.generateLink();
  }

  async loginGoogle(code: string, res: Response): Promise<void> {
    const googleUser = await this.googleHelper.verify(code);

    if (!googleUser) {
      throw new UnauthorizedError('Invalid Google token');
    }

    try {
      const existingUser = await this.userRepository.findOne({
        email: googleUser.email
      });
      const tokens = this.generateAccessAndRefreshToken(existingUser._id);
      const session = await this.sessionService.createSession({
        userId: existingUser._id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + LifeTime.WEEK)
      });
      this.setupResponseCookies(res, session, tokens.accessToken);

      return;
    } catch {
      const hashPassword = await bcrypt.hash(googleUser.sub, 10);
      const newUser = await this.userRepository.create({
        email: googleUser.email,
        name: googleUser.given_name,
        avatarURL: googleUser.picture,
        password: hashPassword
      });

      const tokens = this.generateAccessAndRefreshToken(newUser._id);
      const session = await this.sessionService.createSession({
        userId: newUser._id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + LifeTime.WEEK)
      });
      this.setupResponseCookies(res, session, tokens.accessToken);

      return;
    }
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

  private setupResponseCookies(
    res: Response,
    session: ISession,
    accessToken: string
  ): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + LifeTime.HOUR)
    });
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

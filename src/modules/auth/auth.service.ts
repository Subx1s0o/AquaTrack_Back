import { Service } from 'typedi';

import { RegisterDto } from './dto/register';
import { AuthHelper } from './helpers/auth.helper';

import { UnauthorizedError } from 'routing-controllers';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login';
import SessionService from './helpers/session.service';

import { LifeTime } from '@/libs/global/constants';
import { UserRepository } from '@/modules/users/user.repository';
import { GoogleHelper } from './helpers/google.helper';
import { IAuthResponse } from '@/types/authResponse';

@Service()
class AuthService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService,
    private readonly googleHelper: GoogleHelper
  ) {}

  async register(body: RegisterDto): Promise<IAuthResponse> {
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

    const { password: _, ...userWithoutPassword } = user;

    return JSON.parse(
      JSON.stringify({
        user: userWithoutPassword,
        ...tokens,
        sessionId: session._id
      })
    );
  }

  async login(body: LoginDto): Promise<IAuthResponse> {
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

    const { password: _, ...userWithoutPassword } = user;

    return JSON.parse(
      JSON.stringify({
        user: userWithoutPassword,
        ...tokens,
        sessionId: session._id
      })
    );
  }

  async logout(sessionId: string): Promise<void> {
    return await this.sessionService.deleteSession(sessionId);
  }

  async refresh(
    sessionId: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const session = await this.sessionService.findSession(sessionId);

    if (!session || session.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired, please log in again');
    }

    await this.sessionService.deleteSession(sessionId);

    const newSession = await this.sessionService.createSession({
      userId: session.userId,
      refreshToken,
      expiresAt: new Date(Date.now() + LifeTime.WEEK)
    });

    const tokens = this.generateAccessAndRefreshToken(newSession.userId);

    return JSON.parse(
      JSON.stringify({
        ...tokens,
        sessionId: newSession._id
      })
    );
  }

  returnLink(): string {
    return this.googleHelper.generateLink();
  }

  async loginGoogle(code: string): Promise<IAuthResponse> {
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

      return {
        user: existingUser,
        ...tokens,
        sessionId: session._id
      };
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

      return JSON.parse(
        JSON.stringify({
          user: newUser,
          ...tokens,
          sessionId: session._id
        })
      );
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
}

export default AuthService;

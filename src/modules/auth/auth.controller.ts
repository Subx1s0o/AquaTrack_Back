import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  Req,
  UnauthorizedError
} from 'routing-controllers';
import { Service } from 'typedi';
import AuthService from './auth.service';
import { RegisterDto } from './dto/register';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login';
import { IUser } from '@/libs/db';
@Service()
@Controller('/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Res() res: Response,
    @Body() body: RegisterDto
  ): Promise<{ user: Omit<IUser, 'password'>; accessToken: string }> {
    return await this.authService.register(res, body);
  }

  @Post('/login')
  async login(
    @Res() res: Response,
    @Body() body: LoginDto
  ): Promise<{ user: Omit<IUser, 'password'>; accessToken: string }> {
    return await this.authService.login(res, body);
  }

  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.cookies?.sessionId as string | undefined;

    if (!sessionId) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      throw new UnauthorizedError('You are not logged in');
    }
    await this.authService.logout(sessionId);
    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    return;
  }

  @Post('/refresh')
  @HttpCode(200)
  async refresh(
    @Res() res: Response,
    @Req() req: Request
  ): Promise<{ accessToken: string }> {
    const sessionId = req.cookies?.sessionId as string | undefined;
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    console.log(sessionId, refreshToken);
    if (!sessionId || !refreshToken) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      throw new UnauthorizedError('You are not logged in');
    }

    return await this.authService.refresh(res, sessionId, refreshToken);
  }
}

export default AuthController;

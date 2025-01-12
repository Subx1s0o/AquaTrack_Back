import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  Get,
  Req,
  UnauthorizedError,
  QueryParam
} from 'routing-controllers';
import { Service } from 'typedi';
import AuthService from './auth.service';
import { RegisterDto } from './dto/register';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login';
import { IUser } from '@/libs/db';
import { ConfigService } from '@/libs/global';

@Service()
@Controller('/auth')
class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Res() res: Response,
    @Body() body: RegisterDto
  ): Promise<Omit<IUser, 'password'>> {
    return await this.authService.register(res, body);
  }

  @Post('/login')
  async login(
    @Res() res: Response,
    @Body() body: LoginDto
  ): Promise<Omit<IUser, 'password'>> {
    return await this.authService.login(res, body);
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.cookies?.sessionId as string | undefined;

    if (!sessionId) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      throw new UnauthorizedError('You are not logged in');
    }

    await this.authService.logout(sessionId);
    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(204).end();
  }

  @Post('/refresh')
  async refresh(@Res() res: Response, @Req() req: Request): Promise<void> {
    const sessionId = req.cookies?.sessionId as string | undefined;
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!sessionId || !refreshToken) {
      res.clearCookie('sessionId');
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      throw new UnauthorizedError('You are not logged in');
    }

    await this.authService.refresh(res, sessionId, refreshToken);
    res.status(204).end();
  }

  @Get('/google')
  googleRedirect(@Res() res: Response): void {
    res.redirect(this.authService.returnLink());
  }

  @Get('/google/callback')
  async googleCallback(
    @QueryParam('code') code: string,
    @Res() res: Response
  ): Promise<void> {
    await this.authService.loginGoogle(code, res);

    const frontEndUrl = this.config.get('FRONTEND_LINK');

    res.redirect(frontEndUrl);
  }
}

export default AuthController;

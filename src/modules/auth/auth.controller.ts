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
@Service()
@Controller('/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Res() res: Response,
    @Body() body: RegisterDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.register(res, body);
  }

  @Post('/login')
  @HttpCode(201)
  async login(
    @Res() res: Response,
    @Body() body: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.login(res, body);
  }

  @Post('/logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res() res: Response): Promise<string> {
    const sessionId = req.cookies?.sessionId as string | undefined;

    if (!sessionId) {
      throw new UnauthorizedError('You are not logged in');
    }
    await this.authService.logout(sessionId);
    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    return 'Successfully logged out';
  }
}

export default AuthController;

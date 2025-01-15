import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  Get,
  UnauthorizedError
} from 'routing-controllers';
import { Service } from 'typedi';
import AuthService from './auth.service';
import { RegisterDto } from './dto/register';
import { Response } from 'express';
import { LoginDto } from './dto/login';

import { IAuthResponse } from '@/types/authResponse';
import { LogoutDto } from './dto/logout';
import { RefreshDto } from './dto/refresh';
import { GoogleLoginDTO } from './dto/google';

@Service()
@Controller('/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto): Promise<IAuthResponse> {
    return await this.authService.register(body);
  }

  @Post('/login')
  async login(@Body() body: LoginDto): Promise<IAuthResponse> {
    return await this.authService.login(body);
  }

  @Post('/logout')
  async logout(@Body() data: LogoutDto): Promise<void> {
    return await this.authService.logout(data.sessionId);
  }

  @Post('/refresh')
  async refresh(
    @Body() { refreshToken, sessionId }: RefreshDto
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    if (!sessionId || !refreshToken) {
      throw new UnauthorizedError('You are not logged in');
    }

    return await this.authService.refresh(sessionId, refreshToken);
  }

  @Get('/google')
  googleRedirect(@Res() res: Response): void {
    res.redirect(this.authService.returnLink());
  }

  @Post('/google/callback')
  async googleCallback(@Body() data: GoogleLoginDTO): Promise<IAuthResponse> {
    return await this.authService.loginGoogle(data.code);
  }
}

export default AuthController;

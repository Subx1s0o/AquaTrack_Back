import {
  Post,
  Body,
  HttpCode,
  Res,
  Get,
  Req,
  UnauthorizedError,
  QueryParam,
  JsonController
} from 'routing-controllers';
import { Service } from 'typedi';
import AuthService from './auth.service';
import { RegisterDto } from './dto/register';
import { Response } from 'express';
import { LoginDto } from './dto/login';
import { IUser } from '@/libs/db';
import { ConfigService } from '@/libs/global';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { IAuthResponse } from '@/types/authResponse';
import { LogoutDto } from './dto/logout';
import { RefreshDto } from './dto/refresh';
import { GoogleLoginDTO } from './dto/google';

@Service()
@JsonController('/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  @OpenAPI({
    summary: 'Register a new user',
    description: 'Creates a new user account',
    requestBody: {
      description: 'User registration data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/RegisterDto' }
        }
      }
    },
    responses: {
      201: {
        description: 'User registered successfully'
      }
    }
  })
  @ResponseSchema(RegisterDto)
  async register(@Body() body: RegisterDto): Promise<IAuthResponse> {
    return await this.authService.register(body);
  }

  @Post('/login')
  @OpenAPI({
    summary: 'User login',
    description: 'Authenticates a user and provides an access token.',
    requestBody: {
      description: 'User login credentials',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LoginDto' }
        }
      }
    },
    responses: {
      200: {
        description: 'User logged in successfully'
      }
    }
  })
  @ResponseSchema(LoginDto)
  async login(@Body() body: LoginDto): Promise<IAuthResponse> {
    return await this.authService.login(body);
  }

  @Post('/logout')
  @OpenAPI({
    summary: 'Logout user',
    description: 'Logs out the user by clearing their session and tokens.',
    responses: {
      204: {
        description: 'User logged out successfully'
      },
      401: {
        description: 'User not logged in'
      }
    }
  })
  async logout(@Body() data: LogoutDto): Promise<void> {
    return await this.authService.logout(data.sessionId);
  }

  @Post('/refresh')
  @OpenAPI({
    summary: 'Refresh session tokens',
    description: 'Generates a new set of access and refresh tokens.',
    responses: {
      204: {
        description: 'Tokens refreshed successfully'
      },
      401: {
        description: 'User not logged in'
      }
    }
  })

  async refresh(
    @Body() { refreshToken, sessionId }: RefreshDto
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    if (!sessionId || !refreshToken) {
      throw new UnauthorizedError('You are not logged in');
    }

    return await this.authService.refresh(sessionId, refreshToken);
  }

  @Get('/google')
  @OpenAPI({
    summary: 'Redirect to Google authentication',
    description: 'Redirects the user to the Google authentication page.',
    responses: {
      302: {
        description: 'Redirect to Google login'
      }
    }
  })
  googleRedirect(@Res() res: Response): void {
    res.redirect(this.authService.returnLink());
  }

  
  @OpenAPI({
    summary: 'Google authentication callback',
    description:
      'Handles the Google authentication callback and logs the user in.',
    parameters: [
      {
        name: 'code',
        in: 'query',
        required: true,
        description: 'Google authorization code',
        schema: { type: 'string' }
      }
    ],
    responses: {
      302: {
        description: 'Redirect to frontend after login'
      }
    }
  })
  
  @Post('/google/callback')
  async googleCallback(@Body() data: GoogleLoginDTO): Promise<IAuthResponse> {
    return await this.authService.loginGoogle(data.code);
  }
}

export default AuthController;

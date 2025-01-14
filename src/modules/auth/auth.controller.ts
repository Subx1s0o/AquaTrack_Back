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
import { Response, Request } from 'express';
import { LoginDto } from './dto/login';
import { IUser } from '@/libs/db';
import { ConfigService } from '@/libs/global';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Service()
@JsonController('/auth')
class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

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
  async register(
    @Res() res: Response,
    @Body() body: RegisterDto
  ): Promise<Omit<IUser, 'password'>> {
    return await this.authService.register(res, body);
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
  async login(
    @Res() res: Response,
    @Body() body: LoginDto
  ): Promise<Omit<IUser, 'password'>> {
    return await this.authService.login(res, body);
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

  @Get('/google/callback')
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

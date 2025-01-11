// import { Controller, Get, Authorized, CurrentUser } from 'routing-controllers';
// import { Service } from 'typedi';
// import { IUser } from '@/libs/db/models/user';

// @Service()
// @Controller('/users')
// class UsersController {
//   constructor() {}

//   @Get('/me')
//   @Authorized()
//   async getMe(@CurrentUser({ required: true }) user: IUser): Promise<IUser> {
//     return user;
//   }
// }

// export default UsersController;
import {
  Controller,
  Patch,
  Post,
  Body,
  Authorized,
  CurrentUser,
  HttpCode,
  Req,
  Res
} from 'routing-controllers';
import { Service } from 'typedi';
import UsersService from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from '@/libs/db/models/user';
import { Request, Response } from 'express';

@Service()
@Controller('/users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Эндпоинт для обновления данных пользователя
  @Patch('/me')
  @Authorized()
  async updateMe(
    @CurrentUser({ required: true }) user: IUser,
    @Body() body: UpdateUserDto
  ): Promise<IUser> {
    return await this.usersService.updateUser(user._id, body);
  }

  // 2. Эндпоинт для обновления токенов
  @Post('/refresh')
  @HttpCode(200)
  @Authorized()
  async refreshTokens(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return await this.usersService.refreshTokens(refreshToken, res);
  }

  // 3. Эндпоинт для логаута
  @Post('/logout')
  @HttpCode(204)
  @Authorized()
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    await this.usersService.logout(sessionId);
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
  }
}

export default UsersController;

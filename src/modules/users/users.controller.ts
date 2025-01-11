import { Get } from 'routing-controllers';
import {
  Controller,
  Patch,
  Body,
  Authorized,
  CurrentUser
} from 'routing-controllers';
import { Service } from 'typedi';
import UsersService from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from '@/libs/db/models/user';

@Service()
@Controller('/users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/')
  @Authorized()
  async updateMe(
    @CurrentUser({ required: true }) user: IUser,
    @Body() body: UpdateUserDto
  ): Promise<IUser> {
    return await this.usersService.updateUser(user._id, body);
  }
  @Get('/')
  @Authorized()
  async getMe(@CurrentUser({ required: true }) user: IUser): Promise<IUser> {
    return user;
  }
}

export default UsersController;

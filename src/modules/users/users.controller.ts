import { Get, Req } from 'routing-controllers';
import {
  Controller,
  Patch,
  Post,
  UploadedFile,
  Body,
  Authorized,
  CurrentUser
} from 'routing-controllers';
import { Service } from 'typedi';
import UsersService from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from '@/libs/db/models/user';
import { upload } from '@/libs/utils/cloudinary';
@Service()
@Controller('/users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/')
  @Authorized()
  async updateMe(
    @Req() req: Request & { userId: string },
    @Body() body: UpdateUserDto
  ) {
    return await this.usersService.updateUser(req.userId, body);
  }
  @Get('/')
  @Authorized()
  async getMe(@CurrentUser({ required: true }) user: IUser): Promise<IUser> {
    return user;
  }

  @Post('/avatar')
  @Authorized()
  async uploadAvatar(
    @Req() req: Request & { userId: string },
    @UploadedFile('file', { options: upload }) file: Express.Multer.File
  ) {
    const updatedUser = await this.usersService.updateUser(req.userId, {
      avatarURL: file.path
    });
    return updatedUser;
  }
}

export default UsersController;

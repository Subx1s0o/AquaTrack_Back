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
import multer from 'multer';
import CloudinaryUtil from '@/libs/utils/cloudinary';
import { createCloudinaryStorage } from 'multer-storage-cloudinary';
import { Container } from 'typedi';
import { Params } from '@/libs/utils/cloudinary.types';

const cloudinary = Container.get(CloudinaryUtil).getInstance();

const storage = createCloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  } as Params
});
const upload = multer({ storage });
@Service()
@Controller('/users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/')
  @Authorized()
  async updateMe(
    @Req() req: Request & { userId: string },
    @Body() body: UpdateUserDto
  ): Promise<IUser> {
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
  ): Promise<IUser> {
    const updatedUser = await this.usersService.updateUser(req.userId, {
      avatarURL: file.path
    });
    return updatedUser;
  }
}

export default UsersController;

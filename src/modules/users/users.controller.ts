import { Get, JsonController, Req } from 'routing-controllers';
import {
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
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';


@Service()
@JsonController('/users')
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/')
  @Authorized()
  @OpenAPI({
    summary: 'Update current user profile',
    description: 'Updates the profile of the currently authenticated user.',
    security: [{ cookieAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateUserDto' },
        },
      },
    },
    responses: {
      '200': {
        description: 'User profile updated successfully',
      },
    },
  })
  @ResponseSchema(UpdateUserDto)
  async updateMe(
    @Req() req: Request & { userId: string },
    @Body() body: UpdateUserDto
  ) {
    return await this.usersService.updateUser(req.userId, body);
  }
  @Get('/')
  @Authorized()
  @OpenAPI({
    summary: 'Get current user details',
    description: 'Get details of the currently authenticated user.',
    security: [{ cookieAuth: [] }],
    responses: {
      '200': {
        description: 'User details retrieved successfully',
      },
    },
  })
  @ResponseSchema(UpdateUserDto)
  async getMe(@CurrentUser({ required: true }) user: IUser): Promise<IUser> {
    return user;
  }

  @Post('/avatar')
  @Authorized()
    @OpenAPI({
    summary: 'Upload user avatar',
    description:
      'Allows user to upload and update their avatar.',
    security: [{ cookieAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Avatar updated successfully'
      },
    },
  })
  @ResponseSchema(UpdateUserDto)
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

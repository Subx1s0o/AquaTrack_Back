// import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

// @Controller('users')
// @UseGuards(JwtAuthGuard) // Защита JWT на уровне всего контроллера
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   // Эндпоинт для получения текущего пользователя
//   @Get('me')
//   async getMe(@CurrentUser() user: any) {
//     const userData = await this.usersService.findById(user.id);
//     if (!userData) {
//       throw new NotFoundException('User not found');
//     }
//     return userData;
//   }

//   // Эндпоинт для обновления текущего пользователя
//   @Patch('me')
//   async updateMe(
//     @CurrentUser() user: any,
//     @Body() updateUserDto: UpdateUserDto
//   ) {
//     const updatedUser = await this.usersService.updateUser(
//       user.id,
//       updateUserDto
//     );
//     if (!updatedUser) {
//       throw new NotFoundException('User not found');
//     }
//     return {
//       message: 'User updated successfully',
//       user: updatedUser
//     };
//   }
// }

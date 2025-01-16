import { Service } from 'typedi';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Service()
class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUser(
    userId: string,
    data: UpdateUserDto
  ): Promise<UpdateUserDto> {
    const user = await this.userRepository.updateOne({ _id: userId }, data);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default UsersService;

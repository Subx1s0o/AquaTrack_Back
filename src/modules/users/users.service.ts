import { Service } from 'typedi';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from '@/libs/db/models/user';

@Service()
class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUser(userId: string, data: UpdateUserDto): Promise<IUser> {
    return await this.userRepository.updateOne({ _id: userId }, data);
  }
}

export default UsersService;

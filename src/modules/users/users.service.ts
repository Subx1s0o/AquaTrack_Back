import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { UserRepository } from '@/libs/db/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from '@/libs/db/models/user';
import { Response } from 'express';

@Service()
class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUser(userId: string, data: UpdateUserDto): Promise<IUser> {
    return await this.userRepository.updateOne({ _id: userId }, data);
  }

  async refreshTokens(
    refreshToken: string,
    res: Response
  ): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as JwtPayload;
    } catch {
      throw new Error('Invalid refresh token');
    }

    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '1h'
      }
    );

    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      {
        expiresIn: '7d'
      }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return { accessToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.userRepository.deleteOne({ _id: sessionId });
  }
}

export default UsersService;

import { Controller, Post, Body, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import AuthService from './auth.service';
import { RegisterDto } from './dto/register';

@Service()
@Controller('/auth')
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.register(body);
    return result;
  }
}

export default AuthController;

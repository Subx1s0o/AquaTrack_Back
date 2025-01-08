import { Service } from 'typedi';
import { Logger } from '@/libs/global';
import { RegisterDto } from './dto/register';

@Service()
class AuthService {
  constructor(private readonly logger: Logger) {}

  async register(body: RegisterDto): Promise<RegisterDto> {
    this.logger.log('Registering user with data: ' + JSON.stringify(body));
    return body;
  }
}

export default AuthService;

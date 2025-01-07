import { Service } from 'typedi';
import { Logger } from '@/global';
import { RegisterDtoType } from './dto/register';

@Service()
class AuthService {
  constructor(private readonly logger: Logger) {}

  async register(body: RegisterDtoType) {
    this.logger.log('Registering user with data: ' + JSON.stringify(body));
    return body;
  }
}

export default AuthService;

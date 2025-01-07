import { Service } from 'typedi';
import { Logger } from '../logger/logger';

@Service()
export class ConfigService {
  constructor(private readonly logger: Logger) {}

  get(key: string, defaultValue: string): string {
    const value = process.env[key];
    if (value === undefined) {
      this.logger.warn(
        `Environment variable "${key}" is not defined. Using default: "${defaultValue}"`
      );
      return defaultValue;
    }
    return value;
  }
}

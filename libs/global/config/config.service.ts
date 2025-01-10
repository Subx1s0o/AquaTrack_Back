import { Service } from 'typedi';
import { Logger } from '../logger/logger';

@Service()
export class ConfigService {
  constructor(private readonly logger: Logger) {}

  get(key: string, defaultValue?: string): string {
    const value = process.env[key];

    if (value === undefined) {
      if (defaultValue !== undefined) {
        this.logger.warn(
          `Environment variable "${key}" is not defined. Using default: "${defaultValue}"`
        );
        return defaultValue;
      }

      const errorMessage = `Environment variable "${key}" is not defined and no default value is provided`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return String(value);
  }
}

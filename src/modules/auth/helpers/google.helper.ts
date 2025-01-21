import { ConfigService, Logger } from '@/libs/global';
import { OAuth2Client } from 'google-auth-library';
import { IdTokenPayload } from 'types';
import { Service } from 'typedi';
import { BadRequestError } from 'routing-controllers';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';

@Service()
export class GoogleHelper {
  protected googleConfig: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger
  ) {
    this.googleConfig = new OAuth2Client({
      clientId: this.config.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.config.get('GOOGLE_CLIENT_SECRET'),
      redirectUri:
        process.env.NODE_ENV === 'production'
          ? 'https://aqua-track-xi.vercel.app/google'
          : 'http://localhost:3000/google'
    });
  }

  generateLink(): string {
    return this.googleConfig.generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });
  }

  async verify(code: string): Promise<IdTokenPayload | null | undefined> {
    const encoded = decodeURIComponent(code);
    try {
      const response: GetTokenResponse =
        await this.googleConfig.getToken(encoded);

      if (!response.tokens.id_token) {
        throw new BadRequestError('No id_token in response from Google');
      }

      const ticket = await this.googleConfig.verifyIdToken({
        idToken: response.tokens.id_token,
        audience: this.config.get('GOOGLE_CLIENT_ID')
      });

      const verifiedUser = ticket.getPayload();

      if (!verifiedUser) {
        throw new BadRequestError('No payload from Google');
      }

      this.logger.log('Successfully verified google token');
      return verifiedUser as IdTokenPayload;
    } catch {
      this.logger.error('Failed to get or verify token');

      throw new BadRequestError('Failed to get or verify token');
    }
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Strategy } from 'passport-google-oauth20';

dotenv.config();
if (
  !process.env.GOOGLE_CLIENT_ID &&
  !process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CALLBACK_URL
) {
  console.error(
    'GOOGLE_CLIENT_ID |  GOOGLE_CLIENT_SECRET  | GOOGLE_CALLBACK_URL',
  );
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    // if() {
    // how to extra passport auto if client still login duration time 3 days
    // }
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, emails } = profile;

    return {
      email: emails[0].value,
      name: name.givenName,
    };
  }
}

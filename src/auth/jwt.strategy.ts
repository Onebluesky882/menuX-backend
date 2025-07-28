import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Try cookie first

        (request: Request) => {
          console.log(
            '🔍 Extracting JWT from cookies:',
            request.cookies?.access_token ? 'Found' : 'Not found',
          );
          let token = request?.cookies?.access_token;

          if (!token) {
            token = request?.cookies?.refresh_token;
          }

          return request.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: any) {
    console.log('✅ JWT payload validated:', payload);
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };
  }
}

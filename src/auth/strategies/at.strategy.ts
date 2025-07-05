/** 
    @file at.strategy.ts
    @description Access Token Strategy for authentication using Passport.js.
    This strategy validates the access token and retrieves the user information.
*/
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JWTPayload = {
  sub: number; // User ID
  email: string; // User email
  role: string; // User role (singular)
};
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-at') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Bearer token extraction from Authorization header
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'), //Access token secret key
    });
  }

  validate(payload: JWTPayload) {
    return payload; // Return the payload directly, which contains user information (attach request.user = payload;)
  }
}

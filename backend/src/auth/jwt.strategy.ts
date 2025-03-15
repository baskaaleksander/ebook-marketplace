import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  
  constructor(private readonly configService: ConfigService) {
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: LoginUserDto) {
    return { userId: payload.userId, username: payload.username };
  }
}

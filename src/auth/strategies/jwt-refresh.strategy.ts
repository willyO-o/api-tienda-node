import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenWhitelistService } from '../services/token-whitelist.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private tokenWhitelistService: TokenWhitelistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'tu-secreto-refresh-aqui',
    });
  }

  async validate(payload: any) {
    // Verificar si el refresh_token está en la whitelist
    const isValid = await this.tokenWhitelistService.isTokenValid(payload.jti);
    if (!isValid) {
      throw new ForbiddenException('El refresh_token no es válido o ha sido invalidado');
    }

    return {
      id: payload.sub,
      email: payload.email,
      jti: payload.jti,
    };
  }
}

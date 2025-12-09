import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenWhitelistService } from '../services/token-whitelist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private tokenWhitelistService: TokenWhitelistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-secreto-super-secreto-aqui',
    });
  }

  async validate(payload: any) {
    // Verificar si el token está en la whitelist y es válido
    const isValid = await this.tokenWhitelistService.isTokenValid(payload.jti);
    if (!isValid) {
      throw new ForbiddenException('El token no es válido o ha sido invalidado');
    }

    return {
      id: payload.sub,
      email: payload.email,
      estado: payload.estado,
      jti: payload.jti,
    };
  }
}

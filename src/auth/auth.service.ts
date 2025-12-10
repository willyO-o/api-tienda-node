import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TokenWhitelistService } from './services/token-whitelist.service';
import * as crypto from 'crypto';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  usuario: {
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private tokenWhitelistService: TokenWhitelistService,
  ) {}

  // Validar usuario comparando contraseñas
  async validateUsuario(email: string, password: string): Promise<any> {
    return this.usuariosService.validatePassword(email, password);
  }

  // Login - generar tokens y registrar en whitelist
  async login(usuario: any, ip?: string, dispositivo?: string): Promise<AuthResponse> {
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      estado: usuario.estado,
    };

    const access_token = this.jwtService.sign(
      { ...payload, jti: accessJti },
      {
        secret: process.env.JWT_SECRET || 'tu-secreto-super-secreto-aqui',
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
      { ...payload, jti: refreshJti },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'tu-secreto-refresh-aqui',
        expiresIn: '7d',
      },
    );

    // Registrar en whitelist
    const accessExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    await this.tokenWhitelistService.registerToken(
      accessJti,
      usuario.id,
      'access',
      accessExpires,
      dispositivo,
      ip,
    );

    await this.tokenWhitelistService.registerToken(
      refreshJti,
      usuario.id,
      'refresh',
      refreshExpires,
      dispositivo,
      ip,
    );

    return {
      access_token,
      refresh_token,
      usuario: {
        email: usuario.email,
      },
    };
  }

  // Refrescar tokens
  async refresh(usuario: any, oldRefreshJti: string): Promise<AuthResponse> {
    const usuarioData = await this.usuariosService.findOne(usuario.id);
    if (!usuarioData) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const payload = {
      sub: usuarioData.id,
      email: usuarioData.email,
      estado: usuarioData.estado,
    };

    const access_token = this.jwtService.sign(
      { ...payload, jti: accessJti },
      {
        secret: process.env.JWT_SECRET || 'tu-secreto-super-secreto-aqui',
        expiresIn: '15m',
      },
    );

    const refresh_token = this.jwtService.sign(
      { ...payload, jti: refreshJti },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'tu-secreto-refresh-aqui',
        expiresIn: '7d',
      },
    );

    // Registrar nuevos tokens en whitelist
    const accessExpires = new Date(Date.now() + 15 * 60 * 1000);
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.tokenWhitelistService.registerToken(
      accessJti,
      usuarioData.id,
      'access',
      accessExpires,
    );

    await this.tokenWhitelistService.registerToken(
      refreshJti,
      usuarioData.id,
      'refresh',
      refreshExpires,
    );

    // Invalidar el refresh_token anterior (Token Rotation)
    if (oldRefreshJti) {
      await this.tokenWhitelistService.invalidateToken(oldRefreshJti);
    }

    return {
      access_token,
      refresh_token,
      usuario: {
        email: usuarioData.email,
      },
    };
  }

  // Obtener datos del usuario autenticado
  async getProfile(usuario: any): Promise<any> {
    const usuarioData = await this.usuariosService.findOne(usuario.id);
    if (!usuarioData) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return usuarioData;
  }

  // Logout - invalidar tokens
  async logout(jti: string): Promise<{ message: string }> {
    try {
      await this.tokenWhitelistService.invalidateToken(jti);
      return {
        message: 'Sesión cerrada correctamente. El token ha sido invalidado',
      };
    } catch (error) {
      return {
        message: 'Sesión cerrada',
      };
    }
  }

  /**
   * Cierra sesión en TODOS los dispositivos de un usuario
   */
  async logoutAll(usuario_id: number): Promise<{ message: string }> {
    await this.tokenWhitelistService.invalidateAllUserTokens(usuario_id);
    return {
      message: 'Se ha cerrado sesión en todos los dispositivos',
    };
  }

  /**
   * Obtiene las sesiones activas de un usuario
   */
  async getActiveSessions(usuario_id: number): Promise<any> {
    const tokens = await this.tokenWhitelistService.getActiveTokensByUser(usuario_id);
    
    return tokens
      .filter(t => t.tipo === 'access')
      .map(t => ({
        id: t.id,
        dispositivo: t.dispositivo || 'Desconocido',
        ip: t.ip || 'No registrada',
        creado_el: t.creado_el,
        expires_at: t.expires_at,
        estado: t.estado,
      }));
  }
}

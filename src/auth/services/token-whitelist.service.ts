import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TokenWhitelist } from '../entities/token-whitelist.entity';

@Injectable()
export class TokenWhitelistService {
  constructor(
    @InjectRepository(TokenWhitelist)
    private tokenWhitelistRepository: Repository<TokenWhitelist>,
  ) {}

  /**
   * Registra un token en la whitelist (válido)
   */
  async registerToken(
    jti: string,
    usuario_id: number,
    tipo: string,
    expires_at: Date,
    dispositivo?: string,
    ip?: string,
  ): Promise<TokenWhitelist> {
    const token = this.tokenWhitelistRepository.create({
      jti,
      usuario_id,
      tipo,
      expires_at,
      dispositivo,
      ip,
      estado: 'activo',
    });
    return this.tokenWhitelistRepository.save(token);
  }

  /**
   * Verifica si un token está en la whitelist y es válido
   */
  async isTokenValid(jti: string): Promise<boolean> {
    const token = await this.tokenWhitelistRepository.findOne({
      where: {
        jti,
        estado: 'activo',
      },
    });
    return !!token;
  }

  /**
   * Obtiene los detalles de un token registrado
   */
  async getTokenDetails(jti: string): Promise<TokenWhitelist | null> {
    return this.tokenWhitelistRepository.findOne({
      where: { jti },
    });
  }

  /**
   * Invalida un token específico
   */
  async invalidateToken(jti: string): Promise<void> {
    await this.tokenWhitelistRepository.update(
      { jti },
      {
        estado: 'invalidado',
        invalidado_el: new Date(),
      },
    );
  }

  /**
   * Obtiene todos los tokens activos de un usuario
   */
  async getActiveTokensByUser(usuario_id: number): Promise<TokenWhitelist[]> {
    return this.tokenWhitelistRepository.find({
      where: {
        usuario_id,
        estado: 'activo',
      },
      order: { creado_el: 'DESC' },
    });
  }

  /**
   * Obtiene todos los tokens (activos e inactivos) de un usuario
   */
  async getAllTokensByUser(usuario_id: number): Promise<TokenWhitelist[]> {
    return this.tokenWhitelistRepository.find({
      where: { usuario_id },
      order: { creado_el: 'DESC' },
    });
  }

  /**
   * Invalida todos los tokens de un usuario (cierre de sesión en todos lados)
   */
  async invalidateAllUserTokens(usuario_id: number): Promise<void> {
    await this.tokenWhitelistRepository.update(
      { usuario_id, estado: 'activo' },
      {
        estado: 'invalidado',
        invalidado_el: new Date(),
      },
    );
  }

  /**
   * Invalida todos los tokens de un usuario excepto uno (útil para refresh)
   */
  async invalidateAllButOne(usuario_id: number, keepJti: string): Promise<void> {
    const tokens = await this.getActiveTokensByUser(usuario_id);
    
    for (const token of tokens) {
      if (token.jti !== keepJti) {
        await this.invalidateToken(token.jti);
      }
    }
  }

  /**
   * Limpia tokens expirados de la whitelist (cleanup)
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await this.tokenWhitelistRepository.delete({
      expires_at: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  /**
   * Obtiene estadísticas de tokens
   */
  async getTokenStats(): Promise<{
    totalActivos: number;
    totalInvalidados: number;
    totalExpirados: number;
  }> {
    const activos = await this.tokenWhitelistRepository.count({
      where: { estado: 'activo' },
    });

    const invalidados = await this.tokenWhitelistRepository.count({
      where: { estado: 'invalidado' },
    });

    const expirados = await this.tokenWhitelistRepository.count({
      where: { estado: 'expirado' },
    });

    return { totalActivos: activos, totalInvalidados: invalidados, totalExpirados: expirados };
  }
}

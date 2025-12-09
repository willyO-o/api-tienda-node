import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenWhitelistService } from './services/token-whitelist.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { TokenWhitelist } from './entities/token-whitelist.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    TypeOrmModule.forFeature([TokenWhitelist]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-secreto-super-secreto-aqui',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, TokenWhitelistService],
  exports: [AuthService, JwtModule, TokenWhitelistService],
})
export class AuthModule {}

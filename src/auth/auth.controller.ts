import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req: any): Promise<AuthResponse> {
    // Validar credenciales
    const usuario = await this.authService.validateUsuario(loginDto.email, loginDto.password);
    
    if (!usuario) {
      throw new BadRequestException('Email o contraseña incorrectos');
    }

    // Obtener IP del cliente
    const ip = req.ip || req.connection?.remoteAddress || 'desconocida';
    const dispositivo = req.headers['user-agent'] || 'desconocido';

    // Generar tokens
    return this.authService.login(usuario, ip, dispositivo);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(@Request() req: any): Promise<AuthResponse> {
    const oldRefreshJti = req.user.jti;
    return this.authService.refresh(req.user, oldRefreshJti);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<any> {
    return this.authService.getProfile(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any): Promise<{ message: string }> {
    const jti = req.user.jti;
    return this.authService.logout(jti);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Request() req: any): Promise<{ message: string }> {
    return this.authService.logoutAll(req.user.id);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Request() req: any): Promise<any> {
    return this.authService.getActiveSessions(req.user.id);
  }
}

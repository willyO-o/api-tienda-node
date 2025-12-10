import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('avatars')
export class AvatarsController {
  @Get(':filename')
  async getAvatar(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Validar el nombre del archivo para prevenir directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new NotFoundException('Invalid filename');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);

    // Verificar que el archivo existe y está en el directorio correcto
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(process.cwd(), 'uploads', 'avatars'));

    if (!resolvedPath.startsWith(uploadsDir)) {
      throw new NotFoundException('Invalid path');
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Avatar not found');
    }

    // Enviar el archivo
    res.sendFile(filePath);
  }
}

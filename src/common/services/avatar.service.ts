import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AvatarService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

  constructor() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Genera una paleta de colores vibrantes y distintos
   */
  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', // Rojo vibrante
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul cielo
      '#FFA07A', // Naranja coral
      '#98D8C8', // Verde menta
      '#F7DC6F', // Amarillo dorado
      '#BB8FCE', // Púrpura
      '#85C1E2', // Azul suave
      '#F8B88B', // Naranja suave
      '#FDCB6E', // Amarillo anaranjado
      '#6C5CE7', // Azul profundo
      '#A29BFE', // Púrpura suave
      '#74B9FF', // Azul claro
      '#55EFC4', // Verde esmeralda
      '#FD79A8', // Rosa vibrante
      '#FDCB6E', // Dorado
      '#6C7983', // Gris azulado
      '#E17055', // Naranja-rojo
      '#00B894', // Verde
      '#0984E3', // Azul
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Genera un avatar con la inicial del nombre/email
   */
  async generateAvatar(email: string, usuarioId: number): Promise<string> {
    // Extraer la inicial
    const initial = email.charAt(0).toUpperCase();
    const backgroundColor = this.getRandomColor();

    // Crear canvas
    const size = 200;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo con color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Texto (inicial)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(initial, size / 2, size / 2);

    // Convertir a buffer
    const buffer = canvas.toBuffer('image/png');

    // Optimizar imagen con sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(200, 200)
      .png({ quality: 85 })
      .toBuffer();

    // Generar nombre de archivo único
    const filename = `avatar-${usuarioId}-${Date.now()}.png`;
    const filepath = path.join(this.uploadDir, filename);

    // Guardar archivo
    fs.writeFileSync(filepath, optimizedBuffer);

    // Retornar ruta relativa para almacenar en BD
    return `uploads/avatars/${filename}`;
  }

  /**
   * Elimina un avatar anterior
   */
  async deleteAvatar(avatarPath: string): Promise<void> {
    if (!avatarPath) return;

    try {
      const fullPath = path.join(process.cwd(), avatarPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      // Silenciar errores de eliminación
    }
  }

  /**
   * Obtiene la ruta completa del avatar
   */
  getAvatarPath(avatarUrl: string): string | null {
    if (!avatarUrl) return null;
    return path.join(process.cwd(), avatarUrl);
  }
}

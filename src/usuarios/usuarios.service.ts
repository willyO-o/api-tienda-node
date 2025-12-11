import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Usuario } from './entities/usuario.entity';
import { AvatarService } from '../common/services/avatar.service';

export interface PaginationResult {
  data: Omit<Usuario, 'password'>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private avatarService: AvatarService,
  ) {}

  private encryptPasswordMD5(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  private excludePassword(usuario: Usuario): Omit<Usuario, 'password'> {
    const { password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword as Omit<Usuario, 'password'>;
  }

  async create(usuario: Partial<Usuario>): Promise<Omit<Usuario, 'password'>> {
    if (!usuario.password) {
      throw new BadRequestException('El campo password es requerido');
    }

    // Verificar si el email ya existe
    const existingUsuario = await this.usuariosRepository.findOne({
      where: { email: usuario.email },
    });

    if (existingUsuario) {
      throw new ConflictException(
        `El email "${usuario.email}" ya está registrado`,
      );
    }

    const encryptedPassword = this.encryptPasswordMD5(usuario.password);
    const newUsuario = this.usuariosRepository.create({
      ...usuario,
      password: encryptedPassword,
    });
    const savedUsuario = await this.usuariosRepository.save(newUsuario);

    // Generar avatar si no viene en la solicitud
    if (!usuario.avatar && usuario.email) {
      try {
        const avatarPath = await this.avatarService.generateAvatar(
          usuario.email,
          savedUsuario.id,
        );
        // Actualizar el usuario con el avatar generado
        await this.usuariosRepository.update(savedUsuario.id, {
          avatar: avatarPath,
        });
        savedUsuario.avatar = avatarPath;
      } catch (error) {
        // Si hay error generando avatar, continuar sin él
        console.error('Error generating avatar:', error);
      }
    }
    
    // No retornar el password
    return this.excludePassword(savedUsuario);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
  ): Promise<PaginationResult> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.usuariosRepository.createQueryBuilder('usuario');

    // Excluir superadmin (id = 1)
    queryBuilder.where('usuario.id != :superAdminId', { superAdminId: 1 });

    // Agregar búsqueda si existe
    if (search) {
      queryBuilder.andWhere(
        '(usuario.email LIKE :search OR usuario.estado LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ordenar descendentemente por ID
    queryBuilder.orderBy('usuario.id', 'DESC');

    // Aplicar paginación
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / pageSize);

    // Excluir password de los resultados
    const dataWithoutPassword = data.map(usuario => 
      this.excludePassword(usuario)
    );

    return {
      data: dataWithoutPassword,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Omit<Usuario, 'password'> | null> {
    // if (id === 1) {
    //   throw new ForbiddenException(
    //     'No se puede acceder al usuario con id 1 (superadmin)',
    //   );
    // }
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });
    return usuario ? this.excludePassword(usuario) : null;
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<Omit<Usuario, 'password'>> {
    if (id === 1) {
      throw new ForbiddenException(
        'No se puede modificar al usuario con id 1 (superadmin)',
      );
    }

    const updateData = { ...usuario };

    // No permitir modificar el email
    if (updateData.email) {
      delete updateData.email;
    }

    // Si se proporciona un nuevo avatar, eliminar el anterior
    if (updateData.avatar) {
      try {
        const currentUsuario = await this.usuariosRepository.findOne({
          where: { id },
        });
        if (currentUsuario && currentUsuario.avatar) {
          await this.avatarService.deleteAvatar(currentUsuario.avatar);
        }
      } catch (error) {
        // Continuar con la actualización incluso si hay error
        console.error('Error deleting old avatar:', error);
      }
    }

    // Si se proporciona una nueva password, encriptarla
    if (updateData.password && updateData.password.trim().length > 0) {
      updateData.password = this.encryptPasswordMD5(updateData.password);
    } else {
      delete updateData.password;
    }

    await this.usuariosRepository.update(id, updateData);
    const updated = await this.usuariosRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    
    // No retornar el password
    return this.excludePassword(updated);
  }

  async remove(id: number): Promise<boolean> {
    if (id === 1) {
      throw new ForbiddenException(
        'No se puede eliminar al usuario con id 1 (superadmin)',
      );
    }

    // Obtener usuario para eliminar su avatar
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    
    // Eliminar avatar del servidor si existe
    if (usuario && usuario.avatar) {
      try {
        await this.avatarService.deleteAvatar(usuario.avatar);
      } catch (error) {
        // Continuar con la eliminación incluso si hay error
        console.error('Error deleting avatar:', error);
      }
    }

    const result = await this.usuariosRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  // Buscar usuario por email (para autenticación)
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'estado', 'avatar', 'creado_el'],
    });
  }

  // Validar contraseña
  async validatePassword(email: string, password: string): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await this.findByEmail(email);
    if (!usuario) {
      return null;
    }

    // Comparar password con MD5
    const hashedPassword = this.encryptPasswordMD5(password);
    if (usuario.password !== hashedPassword) {
      return null;
    }

    return this.excludePassword(usuario);
  }
}

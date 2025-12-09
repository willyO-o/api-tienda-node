import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Usuario } from './entities/usuario.entity';

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

    const encryptedPassword = this.encryptPasswordMD5(usuario.password);
    const newUsuario = this.usuariosRepository.create({
      ...usuario,
      password: encryptedPassword,
    });
    const savedUsuario = await this.usuariosRepository.save(newUsuario);
    
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
    if (id === 1) {
      throw new ForbiddenException(
        'No se puede acceder al usuario con id 1 (superadmin)',
      );
    }
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
    const result = await this.usuariosRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

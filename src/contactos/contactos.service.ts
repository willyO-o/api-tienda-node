import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacto } from './entities/contacto.entity';
import { CreateContactoDto } from './dto/create-contacto.dto';

export interface PaginationResult {
  data: Contacto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ContactosService {
  constructor(
    @InjectRepository(Contacto)
    private contactosRepository: Repository<Contacto>,
  ) {}

  async create(createContactoDto: CreateContactoDto): Promise<Contacto> {
    const contacto = this.contactosRepository.create(createContactoDto);
    return this.contactosRepository.save(contacto);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    estado?: string,
  ): Promise<PaginationResult> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.contactosRepository.createQueryBuilder('contacto');

    // Agregar búsqueda si existe
    if (search) {
      queryBuilder.where(
        '(contacto.nombre_completo LIKE :search OR contacto.correo LIKE :search OR contacto.mensaje LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      if (queryBuilder.expressionMap.wheres.length > 0) {
        queryBuilder.andWhere('contacto.estado = :estado', { estado });
      } else {
        queryBuilder.where('contacto.estado = :estado', { estado });
      }
    }

    // Ordenar descendentemente por ID (más recientes primero)
    queryBuilder.orderBy('contacto.id', 'DESC');

    // Aplicar paginación
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Contacto | null> {
    return this.contactosRepository.findOne({
      where: { id },
    });
  }

  async updateEstado(id: number, estado: string): Promise<Contacto | null> {
    const contacto = await this.findOne(id);
    if (!contacto) {
      throw new NotFoundException(`Contacto con id ${id} no encontrado`);
    }

    await this.contactosRepository.update(id, { estado });
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.contactosRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

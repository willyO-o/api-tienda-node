import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

export interface PaginationResult {
  data: Categoria[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    // Verificar si la categoría ya existe
    const existingCategoria = await this.categoriasRepository.findOne({
      where: { categoria: createCategoriaDto.categoria },
    });

    if (existingCategoria) {
      throw new ConflictException(
        `La categoría "${createCategoriaDto.categoria}" ya existe`,
      );
    }

    const categoria = this.categoriasRepository.create(createCategoriaDto);
    return this.categoriasRepository.save(categoria);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
  ): Promise<PaginationResult> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.categoriasRepository.createQueryBuilder('categoria');

    // Agregar búsqueda si existe
    if (search) {
      queryBuilder.where(
        '(categoria.categoria LIKE :search OR categoria.estado LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ordenar descendentemente por ID
    queryBuilder.orderBy('categoria.id', 'DESC');

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

  async findOne(id: number): Promise<Categoria | null> {
    return this.categoriasRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria | null> {
    const categoria = await this.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }

    // Si se intenta cambiar el nombre, verificar que no exista ya CON OTRO ID
    if (updateCategoriaDto.categoria && updateCategoriaDto.categoria !== categoria.categoria) {
      const existingCategoria = await this.categoriasRepository.findOne({
        where: { 
          categoria: updateCategoriaDto.categoria,
        },
      });

      // Solo rechazar si existe y tiene un ID diferente
      if (existingCategoria && existingCategoria.id !== id) {
        throw new ConflictException(
          `La categoría "${updateCategoriaDto.categoria}" ya existe`,
        );
      }
    }

    await this.categoriasRepository.update(id, updateCategoriaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.categoriasRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

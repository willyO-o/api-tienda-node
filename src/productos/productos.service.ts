import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CategoriasService } from '../categorias/categorias.service';

export interface PaginationResult {
  data: Producto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    private categoriasService: CategoriasService,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    // Validar que la categoría exista
    const categoria = await this.categoriasService.findOne(createProductoDto.categoria_id);
    if (!categoria) {
      throw new BadRequestException(
        `La categoría con id ${createProductoDto.categoria_id} no existe`,
      );
    }

    // Validar que haya al menos una imagen
    if (!createProductoDto.imagen || createProductoDto.imagen.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos una imagen');
    }

    const producto = this.productosRepository.create(createProductoDto);
    return this.productosRepository.save(producto);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    categoria_id?: number,
  ): Promise<PaginationResult> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.productosRepository.createQueryBuilder('producto');

    // Agregar búsqueda si existe
    if (search) {
      queryBuilder.where(
        '(producto.titulo LIKE :search OR producto.descripcion LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtrar por categoría si se proporciona
    if (categoria_id) {
      if (queryBuilder.expressionMap.wheres.length > 0) {
        queryBuilder.andWhere('producto.categoria_id = :categoria_id', { categoria_id });
      } else {
        queryBuilder.where('producto.categoria_id = :categoria_id', { categoria_id });
      }
    }

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

  async findOne(id: number): Promise<Producto | null> {
    return this.productosRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto | null> {
    const producto = await this.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    // Validar que la categoría exista si se intenta cambiar
    if (updateProductoDto.categoria_id && updateProductoDto.categoria_id !== producto.categoria_id) {
      const categoria = await this.categoriasService.findOne(updateProductoDto.categoria_id);
      if (!categoria) {
        throw new BadRequestException(
          `La categoría con id ${updateProductoDto.categoria_id} no existe`,
        );
      }
    }

    await this.productosRepository.update(id, updateProductoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.productosRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

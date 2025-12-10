import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductoResponseDto } from './dto/producto-response.dto';
import { CategoriasService } from '../categorias/categorias.service';

export interface PaginationResult {
  data: ProductoResponseDto[];
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

  private mapProductoResponse(producto: Producto): ProductoResponseDto {
    return {
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      precio: producto.precio,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
      categoria_nombre: producto.categoria?.categoria || undefined,
      creado_el: producto.creado_el,
    };
  }

  async create(createProductoDto: CreateProductoDto): Promise<ProductoResponseDto> {
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
    const savedProducto = await this.productosRepository.save(producto);
    return this.mapProductoResponse(savedProducto);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    categoria_id?: number,
  ): Promise<PaginationResult> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.productosRepository.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria');

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

    // Ordenar descendentemente por ID
    queryBuilder.orderBy('producto.id', 'DESC');

    // Aplicar paginación
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / pageSize);

    // Mapear productos con nombre de categoría
    const mappedData = data.map(producto => this.mapProductoResponse(producto));

    return {
      data: mappedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: number): Promise<ProductoResponseDto | null> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
    return producto ? this.mapProductoResponse(producto) : null;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoResponseDto | null> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
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
    const updated = await this.findOne(id);
    return updated;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.productosRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

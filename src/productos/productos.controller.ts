import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductosService, PaginationResult } from './productos.service';
import { ProductoResponseDto } from './dto/producto-response.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/productos')
export class ProductosController {
  constructor(private productosService: ProductosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductoDto: CreateProductoDto): Promise<ProductoResponseDto> {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('categoria_id') categoria_id?: string,
  ): Promise<PaginationResult> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    const categoriaId = categoria_id ? parseInt(categoria_id, 10) : undefined;
    return this.productosService.findAll(pageNum, pageSizeNum, search, categoriaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductoResponseDto> {
    const producto = await this.productosService.findOne(parseInt(id));
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return producto;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoResponseDto | null> {
    return this.productosService.update(parseInt(id), updateProductoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.productosService.remove(parseInt(id));
    return { success };
  }
}

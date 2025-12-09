import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { Producto } from './entities/producto.entity';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Producto]), CategoriasModule],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [TypeOrmModule],
})
export class ProductosModule {}

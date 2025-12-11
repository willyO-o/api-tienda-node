import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { CategoriasModule } from './categorias/categorias.module';
import { Categoria } from './categorias/entities/categoria.entity';
import { ProductosModule } from './productos/productos.module';
import { Producto } from './productos/entities/producto.entity';
import { AuthModule } from './auth/auth.module';
import { TokenWhitelist } from './auth/entities/token-whitelist.entity';
import { CommonModule } from './common/common.module';
import { ContactosModule } from './contactos/contactos.module';
import { Contacto } from './contactos/entities/contacto.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tienda_db',
      entities: [Usuario, Categoria, Producto, TokenWhitelist, Contacto],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    CommonModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    AuthModule,
    ContactosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

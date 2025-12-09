import { DataSource } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tienda_db',
  entities: [Usuario],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: true,
});

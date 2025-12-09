import { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tienda_db',
  entities: ['dist/src/usuarios/entities/*.js'],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false,
  logging: true,
};

export = config;

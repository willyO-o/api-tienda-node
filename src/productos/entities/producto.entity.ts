import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  titulo: string;

  @Column({
    type: 'text',
  })
  descripcion: string;

  @Column({
    type: 'json',
  })
  imagen: string[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precio: number;

  @Column({
    type: 'int',
  })
  stock: number;

  @Column({
    type: 'int',
  })
  categoria_id: number;

  @ManyToOne(() => Categoria, {
    eager: true,
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creado_el: Date;
}

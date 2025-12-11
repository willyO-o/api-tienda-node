import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contactos')
export class Contacto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  nombre_completo: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  correo: string;

  @Column({
    type: 'longtext',
  })
  mensaje: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pendiente',
  })
  estado: string; // pendiente, leido, respondido

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creado_el: Date;
}

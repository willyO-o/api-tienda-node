import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('token_whitelist')
@Index('IDX_jti', ['jti'])
@Index('IDX_usuario_id', ['usuario_id'])
@Index('IDX_expires_at', ['expires_at'])
export class TokenWhitelist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  jti: string; // JWT ID único (fingerprint del token)

  @Column({
    type: 'int',
  })
  usuario_id: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  tipo: string; // 'access' o 'refresh'

  @Column({
    type: 'varchar',
    length: 50,
    default: 'activo',
  })
  estado: string; // 'activo', 'invalidado', 'expirado'

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  dispositivo: string; // Identificador del dispositivo/navegador (opcional)

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ip: string; // IP desde la que se generó el token (para auditoría)

  @Column({
    type: 'timestamp',
  })
  expires_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creado_el: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  invalidado_el: Date; // Cuándo se invalidó (si aplica)
}

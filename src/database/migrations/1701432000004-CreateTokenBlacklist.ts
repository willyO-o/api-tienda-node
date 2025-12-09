import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTokenWhitelist1701432000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'token_whitelist',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'jti',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'usuario_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '50',
            default: "'activo'",
            isNullable: false,
          },
          {
            name: 'dispositivo',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'creado_el',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'invalidado_el',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índices para optimizar búsquedas
    await queryRunner.query(
      'CREATE INDEX IDX_jti ON token_whitelist (jti)',
    );

    await queryRunner.query(
      'CREATE INDEX IDX_usuario_id ON token_whitelist (usuario_id)',
    );

    await queryRunner.query(
      'CREATE INDEX IDX_expires_at ON token_whitelist (expires_at)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('token_whitelist');
  }
}

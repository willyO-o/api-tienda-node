import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsuariosTable1701432000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
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
            name: 'avatar',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'creado_el',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
  }
}

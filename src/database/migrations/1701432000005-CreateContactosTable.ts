import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContactosTable1701432000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contactos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nombre_completo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'correo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mensaje',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '50',
            default: "'pendiente'",
            isNullable: false,
          },
          {
            name: 'creado_el',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contactos');
  }
}

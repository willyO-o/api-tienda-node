import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordToUsuarios1701432000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'usuarios',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        length: '255',
        isNullable: false,
        default: "''",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('usuarios', 'password');
  }
}

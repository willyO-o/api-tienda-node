import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductosTable1701432000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'productos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'descripcion',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'imagen',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'precio',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'stock',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'categoria_id',
            type: 'int',
            isNullable: false,
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

    // Agregar llave foránea
    await queryRunner.createForeignKey(
      'productos',
      new TableForeignKey({
        columnNames: ['categoria_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categorias',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('productos');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('categoria_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('productos', foreignKey);
      }
    }
    await queryRunner.dropTable('productos');
  }
}

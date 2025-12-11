import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandDeviceColumnTokenWhitelist1701432000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_whitelist\` MODIFY COLUMN \`dispositivo\` varchar(500) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_whitelist\` MODIFY COLUMN \`dispositivo\` varchar(100) NULL`,
    );
  }
}

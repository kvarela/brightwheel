import { MigrationInterface, QueryRunner } from 'typeorm'

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001'

export class SeedOneAlbuquerque1745452802000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "school" ("id", "name", "slug", "escalationThreshold", "isActive", "createdAt", "updatedAt")
      VALUES (
        '${SCHOOL_ID}',
        'One Albuquerque Family & Community Services',
        'one-albuquerque-family-community-services',
        0.80,
        false,
        now(),
        now()
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "school" WHERE "id" = '${SCHOOL_ID}'`)
  }
}

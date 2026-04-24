import { MigrationInterface, QueryRunner } from 'typeorm'

const SCHOOLS = [
  { id: '00000000-0000-0000-0000-000000000002', name: 'Bright Horizons at Downtown Denver', slug: 'bright-horizons-downtown-denver' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sunshine Academy Early Learning', slug: 'sunshine-academy-early-learning' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Little Sprouts Childcare Center', slug: 'little-sprouts-childcare-center' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Rainbow Bridge Preschool', slug: 'rainbow-bridge-preschool' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Tiny Tots Learning Academy', slug: 'tiny-tots-learning-academy' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Kiddie College Daycare', slug: 'kiddie-college-daycare' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Growing Minds Childcare', slug: 'growing-minds-childcare' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Happy Hearts Early Education', slug: 'happy-hearts-early-education' },
]

export class SeedSchools1745452803000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "school" SET "isActive" = true WHERE "id" = '00000000-0000-0000-0000-000000000001'
    `)

    const values = SCHOOLS.map(
      ({ id, name, slug }) =>
        `('${id}', '${name}', '${slug}', 0.80, true, now(), now())`,
    ).join(',\n      ')

    await queryRunner.query(`
      INSERT INTO "school" ("id", "name", "slug", "escalationThreshold", "isActive", "createdAt", "updatedAt")
      VALUES
        ${values}
      ON CONFLICT ("id") DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ids = SCHOOLS.map((s) => `'${s.id}'`).join(', ')
    await queryRunner.query(`DELETE FROM "school" WHERE "id" IN (${ids})`)
    await queryRunner.query(`
      UPDATE "school" SET "isActive" = false WHERE "id" = '00000000-0000-0000-0000-000000000001'
    `)
  }
}

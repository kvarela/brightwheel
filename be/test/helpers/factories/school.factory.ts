import { DataSource } from 'typeorm'
import { School } from '../../../src/modules/school/entities/school.entity'

let counter = 0

export async function createTestSchool(
  db: DataSource,
  overrides: Partial<School> = {},
): Promise<School> {
  counter += 1
  const repo = db.getRepository(School)
  const school = repo.create({
    name: overrides.name ?? `Test School ${counter}`,
    slug: overrides.slug ?? `test-school-${counter}-${Date.now()}`,
    escalationThreshold: overrides.escalationThreshold ?? 0.8,
    isActive: overrides.isActive ?? false,
  })
  return repo.save(school)
}

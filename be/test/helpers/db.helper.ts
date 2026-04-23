import { DataSource } from 'typeorm'

export async function truncateAll(db: DataSource): Promise<void> {
  const entities = db.entityMetadatas
  for (const entity of entities) {
    const repo = db.getRepository(entity.name)
    await repo.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
  }
}

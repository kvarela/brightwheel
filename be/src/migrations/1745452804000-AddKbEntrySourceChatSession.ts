import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddKbEntrySourceChatSession1745452804000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "knowledge_base_entry"
      ADD COLUMN "sourceChatSessionId" uuid
    `)
    await queryRunner.query(`
      ALTER TABLE "knowledge_base_entry"
      ADD CONSTRAINT "FK_knowledge_base_entry_source_chat_session"
      FOREIGN KEY ("sourceChatSessionId") REFERENCES "chat_session"("id")
    `)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_knowledge_base_entry_source_chat_session"
      ON "knowledge_base_entry" ("sourceChatSessionId")
      WHERE "sourceChatSessionId" IS NOT NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_knowledge_base_entry_source_chat_session"`)
    await queryRunner.query(
      `ALTER TABLE "knowledge_base_entry" DROP CONSTRAINT "FK_knowledge_base_entry_source_chat_session"`,
    )
    await queryRunner.query(
      `ALTER TABLE "knowledge_base_entry" DROP COLUMN "sourceChatSessionId"`,
    )
  }
}

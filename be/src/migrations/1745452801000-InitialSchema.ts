import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1745452801000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum types
    await queryRunner.query(`
      CREATE TYPE "staff_role_enum" AS ENUM ('admin', 'staff')
    `)
    await queryRunner.query(`
      CREATE TYPE "base_inquiry_key_enum" AS ENUM (
        'operating_hours', 'tuition_rates', 'enrollment_process', 'age_groups',
        'dropoff_pickup', 'meals_snacks', 'illness_policy', 'communication_cadence',
        'staff_child_ratios', 'outdoor_activity', 'emergency_procedures', 'waitlist_process'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "knowledge_base_source_enum" AS ENUM (
        'manual', 'handbook_extraction', 'escalation_learning'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "handbook_file_type_enum" AS ENUM ('pdf', 'docx', 'txt')
    `)
    await queryRunner.query(`
      CREATE TYPE "handbook_upload_status_enum" AS ENUM (
        'pending', 'processing', 'completed', 'failed'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "handbook_version_status_enum" AS ENUM (
        'pending_review', 'accepted', 'rejected'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "handbook_diff_change_type_enum" AS ENUM ('add', 'update', 'delete')
    `)
    await queryRunner.query(`
      CREATE TYPE "handbook_diff_status_enum" AS ENUM ('pending', 'accepted', 'rejected')
    `)
    await queryRunner.query(`
      CREATE TYPE "extraction_confidence_enum" AS ENUM ('high', 'medium', 'low')
    `)
    await queryRunner.query(`
      CREATE TYPE "chat_session_status_enum" AS ENUM (
        'active', 'escalated', 'resolved', 'closed'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "inbox_state_enum" AS ENUM (
        'needs_attention', 'in_progress', 'resolved'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE "message_role_enum" AS ENUM ('parent', 'ai', 'staff')
    `)
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM ('escalation', 'new_message')
    `)

    // Tables (in FK dependency order)

    await queryRunner.query(`
      CREATE TABLE "school" (
        "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
        "name"                   character varying        NOT NULL,
        "slug"                   character varying        NOT NULL,
        "escalationThreshold"    numeric(3,2)             NOT NULL DEFAULT 0.8,
        "isActive"               boolean                  NOT NULL DEFAULT false,
        "onboardingCompletedAt"  TIMESTAMP WITH TIME ZONE,
        "createdAt"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt"              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school"       PRIMARY KEY ("id"),
        CONSTRAINT "UQ_school_slug"  UNIQUE ("slug")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "staff_user" (
        "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
        "schoolId"     uuid                     NOT NULL,
        "email"        character varying        NOT NULL,
        "passwordHash" character varying        NOT NULL,
        "fullName"     character varying        NOT NULL,
        "role"         "staff_role_enum"        NOT NULL,
        "isActive"     boolean                  NOT NULL DEFAULT true,
        "lastSeenAt"   TIMESTAMP WITH TIME ZONE,
        "createdAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_user"                PRIMARY KEY ("id"),
        CONSTRAINT "UQ_staff_user_school_email"   UNIQUE ("schoolId", "email"),
        CONSTRAINT "FK_staff_user_school"         FOREIGN KEY ("schoolId") REFERENCES "school"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "handbook_upload" (
        "id"           uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "schoolId"     uuid                          NOT NULL,
        "fileKey"      character varying             NOT NULL,
        "fileName"     character varying             NOT NULL,
        "fileType"     "handbook_file_type_enum"     NOT NULL,
        "status"       "handbook_upload_status_enum" NOT NULL DEFAULT 'pending',
        "uploadedById" uuid                          NOT NULL,
        "errorMessage" text,
        "createdAt"    TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
        CONSTRAINT "PK_handbook_upload"          PRIMARY KEY ("id"),
        CONSTRAINT "FK_handbook_upload_school"   FOREIGN KEY ("schoolId")     REFERENCES "school"("id"),
        CONSTRAINT "FK_handbook_upload_uploader" FOREIGN KEY ("uploadedById") REFERENCES "staff_user"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "handbook_version" (
        "id"             uuid                           NOT NULL DEFAULT gen_random_uuid(),
        "schoolId"       uuid                           NOT NULL,
        "uploadId"       uuid                           NOT NULL,
        "versionNumber"  integer                        NOT NULL,
        "status"         "handbook_version_status_enum" NOT NULL DEFAULT 'pending_review',
        "reviewedById"   uuid,
        "reviewedAt"     TIMESTAMP WITH TIME ZONE,
        "createdAt"      TIMESTAMP WITH TIME ZONE       NOT NULL DEFAULT now(),
        "updatedAt"      TIMESTAMP WITH TIME ZONE       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_handbook_version"           PRIMARY KEY ("id"),
        CONSTRAINT "UQ_handbook_version_upload"    UNIQUE ("uploadId"),
        CONSTRAINT "FK_handbook_version_school"    FOREIGN KEY ("schoolId")     REFERENCES "school"("id"),
        CONSTRAINT "FK_handbook_version_upload"    FOREIGN KEY ("uploadId")     REFERENCES "handbook_upload"("id"),
        CONSTRAINT "FK_handbook_version_reviewer"  FOREIGN KEY ("reviewedById") REFERENCES "staff_user"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "knowledge_base_entry" (
        "id"                 uuid                          NOT NULL DEFAULT gen_random_uuid(),
        "schoolId"           uuid                          NOT NULL,
        "question"           text                          NOT NULL,
        "answer"             text                          NOT NULL,
        "embedding"          real[],
        "isBaseInquiry"      boolean                       NOT NULL DEFAULT false,
        "baseInquiryKey"     "base_inquiry_key_enum",
        "source"             "knowledge_base_source_enum"  NOT NULL,
        "handbookVersionId"  uuid,
        "isActive"           boolean                       NOT NULL DEFAULT true,
        "createdAt"          TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
        "updatedAt"          TIMESTAMP WITH TIME ZONE      NOT NULL DEFAULT now(),
        CONSTRAINT "PK_knowledge_base_entry"                    PRIMARY KEY ("id"),
        CONSTRAINT "FK_knowledge_base_entry_school"             FOREIGN KEY ("schoolId")          REFERENCES "school"("id"),
        CONSTRAINT "FK_knowledge_base_entry_handbook_version"   FOREIGN KEY ("handbookVersionId") REFERENCES "handbook_version"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "handbook_diff_entry" (
        "id"                   uuid                              NOT NULL DEFAULT gen_random_uuid(),
        "handbookVersionId"    uuid                              NOT NULL,
        "knowledgeBaseEntryId" uuid,
        "changeType"           "handbook_diff_change_type_enum"  NOT NULL,
        "proposedQuestion"     text                              NOT NULL,
        "proposedAnswer"       text                              NOT NULL,
        "sourceExcerpt"        text,
        "extractionConfidence" "extraction_confidence_enum",
        "status"               "handbook_diff_status_enum"       NOT NULL DEFAULT 'pending',
        "createdAt"            TIMESTAMP WITH TIME ZONE          NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMP WITH TIME ZONE          NOT NULL DEFAULT now(),
        CONSTRAINT "PK_handbook_diff_entry"                   PRIMARY KEY ("id"),
        CONSTRAINT "FK_handbook_diff_entry_version"           FOREIGN KEY ("handbookVersionId")    REFERENCES "handbook_version"("id"),
        CONSTRAINT "FK_handbook_diff_entry_kb_entry"          FOREIGN KEY ("knowledgeBaseEntryId") REFERENCES "knowledge_base_entry"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "chat_session" (
        "id"               uuid                       NOT NULL DEFAULT gen_random_uuid(),
        "schoolId"         uuid                       NOT NULL,
        "parentName"       character varying,
        "parentEmail"      character varying,
        "sessionToken"     character varying          NOT NULL,
        "status"           "chat_session_status_enum" NOT NULL DEFAULT 'active',
        "inboxState"       "inbox_state_enum",
        "assignedStaffId"  uuid,
        "escalatedAt"      TIMESTAMP WITH TIME ZONE,
        "resolvedAt"       TIMESTAMP WITH TIME ZONE,
        "createdAt"        TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_session"                  PRIMARY KEY ("id"),
        CONSTRAINT "UQ_chat_session_token"            UNIQUE ("sessionToken"),
        CONSTRAINT "FK_chat_session_school"           FOREIGN KEY ("schoolId")        REFERENCES "school"("id"),
        CONSTRAINT "FK_chat_session_assigned_staff"   FOREIGN KEY ("assignedStaffId") REFERENCES "staff_user"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "message" (
        "id"                  uuid                  NOT NULL DEFAULT gen_random_uuid(),
        "chatSessionId"       uuid                  NOT NULL,
        "role"                "message_role_enum"   NOT NULL,
        "content"             text                  NOT NULL,
        "certaintyScore"      numeric(3,2),
        "isEscalationTrigger" boolean               NOT NULL DEFAULT false,
        "sentByStaffId"       uuid,
        "createdAt"           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_message"                  PRIMARY KEY ("id"),
        CONSTRAINT "FK_message_chat_session"     FOREIGN KEY ("chatSessionId")  REFERENCES "chat_session"("id"),
        CONSTRAINT "FK_message_sent_by_staff"    FOREIGN KEY ("sentByStaffId")  REFERENCES "staff_user"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "message_knowledge_base_entry" (
        "messageId"            uuid            NOT NULL,
        "knowledgeBaseEntryId" uuid            NOT NULL,
        "similarityScore"      numeric(5,4)    NOT NULL,
        CONSTRAINT "PK_message_knowledge_base_entry" PRIMARY KEY ("messageId", "knowledgeBaseEntryId"),
        CONSTRAINT "FK_mkbe_message"    FOREIGN KEY ("messageId")            REFERENCES "message"("id"),
        CONSTRAINT "FK_mkbe_kb_entry"   FOREIGN KEY ("knowledgeBaseEntryId") REFERENCES "knowledge_base_entry"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id"            uuid                       NOT NULL DEFAULT gen_random_uuid(),
        "staffUserId"   uuid                       NOT NULL,
        "chatSessionId" uuid                       NOT NULL,
        "type"          "notification_type_enum"   NOT NULL,
        "isRead"        boolean                    NOT NULL DEFAULT false,
        "readAt"        TIMESTAMP WITH TIME ZONE,
        "createdAt"     TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification"              PRIMARY KEY ("id"),
        CONSTRAINT "FK_notification_staff_user"   FOREIGN KEY ("staffUserId")   REFERENCES "staff_user"("id"),
        CONSTRAINT "FK_notification_chat_session" FOREIGN KEY ("chatSessionId") REFERENCES "chat_session"("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notification"`)
    await queryRunner.query(`DROP TABLE "message_knowledge_base_entry"`)
    await queryRunner.query(`DROP TABLE "message"`)
    await queryRunner.query(`DROP TABLE "chat_session"`)
    await queryRunner.query(`DROP TABLE "handbook_diff_entry"`)
    await queryRunner.query(`DROP TABLE "knowledge_base_entry"`)
    await queryRunner.query(`DROP TABLE "handbook_version"`)
    await queryRunner.query(`DROP TABLE "handbook_upload"`)
    await queryRunner.query(`DROP TABLE "staff_user"`)
    await queryRunner.query(`DROP TABLE "school"`)

    await queryRunner.query(`DROP TYPE "notification_type_enum"`)
    await queryRunner.query(`DROP TYPE "message_role_enum"`)
    await queryRunner.query(`DROP TYPE "inbox_state_enum"`)
    await queryRunner.query(`DROP TYPE "chat_session_status_enum"`)
    await queryRunner.query(`DROP TYPE "extraction_confidence_enum"`)
    await queryRunner.query(`DROP TYPE "handbook_diff_status_enum"`)
    await queryRunner.query(`DROP TYPE "handbook_diff_change_type_enum"`)
    await queryRunner.query(`DROP TYPE "handbook_version_status_enum"`)
    await queryRunner.query(`DROP TYPE "handbook_upload_status_enum"`)
    await queryRunner.query(`DROP TYPE "handbook_file_type_enum"`)
    await queryRunner.query(`DROP TYPE "knowledge_base_source_enum"`)
    await queryRunner.query(`DROP TYPE "base_inquiry_key_enum"`)
    await queryRunner.query(`DROP TYPE "staff_role_enum"`)
  }
}

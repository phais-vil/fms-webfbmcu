-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MEMO', 'PROJECT_PROPOSAL', 'BUDGET_REQUEST', 'GENERAL_REQUEST');

-- CreateEnum
CREATE TYPE "DocumentUrgency" AS ENUM ('NORMAL', 'URGENT', 'VERY_URGENT', 'EXPEDITE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "faculty_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_number" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "doc_type" "DocumentType" NOT NULL DEFAULT 'MEMO',
    "urgency" "DocumentUrgency" NOT NULL DEFAULT 'NORMAL',
    "status" "DocumentStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitter_name" VARCHAR(150) NOT NULL,
    "submitter_role" VARCHAR(150),
    "submitter_email" VARCHAR(255),
    "department" VARCHAR(150),
    "content" TEXT NOT NULL,
    "budget_amount" DECIMAL(12,2),
    "attachment_url" VARCHAR(500),
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faculty_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_document_logs" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "actor_name" VARCHAR(150) NOT NULL,
    "actor_role" VARCHAR(150) NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_document_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculty_documents_document_number_key" ON "faculty_documents"("document_number");

-- CreateIndex
CREATE INDEX "faculty_documents_tenant_id_status_idx" ON "faculty_documents"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "faculty_documents_document_number_idx" ON "faculty_documents"("document_number");

-- CreateIndex
CREATE INDEX "faculty_document_logs_document_id_idx" ON "faculty_document_logs"("document_id");

-- AddForeignKey
ALTER TABLE "faculty_documents" ADD CONSTRAINT "faculty_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_document_logs" ADD CONSTRAINT "faculty_document_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "faculty_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

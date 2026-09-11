-- CreateEnum
CREATE TYPE "CertificateCategory" AS ENUM ('ENROLLMENT', 'CONDUCT', 'BANK_ACCOUNT', 'MILITARY_DEFERMENT', 'VOLUNTEER', 'TRANSCRIPT_REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "certificate_types" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(150) NOT NULL,
    "name_en" VARCHAR(150) NOT NULL,
    "description_th" TEXT,
    "description_en" TEXT,
    "category" "CertificateCategory" NOT NULL DEFAULT 'ENROLLMENT',
    "processing_days" INTEGER NOT NULL DEFAULT 3,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "requires_doc" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "certificate_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "certificate_type_id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "student_code" VARCHAR(50) NOT NULL,
    "title_th" VARCHAR(50),
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100),
    "last_name_en" VARCHAR(100),
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "major_program" VARCHAR(150) NOT NULL,
    "year_level" INTEGER NOT NULL DEFAULT 1,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "purpose" TEXT NOT NULL,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "verification_code" VARCHAR(100),
    "issued_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "approver_notes" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificate_types_tenant_id_category_idx" ON "certificate_types"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "certificate_types_tenant_id_is_active_idx" ON "certificate_types"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_types_tenant_id_code_key" ON "certificate_types"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "student_requests_request_number_key" ON "student_requests"("request_number");

-- CreateIndex
CREATE UNIQUE INDEX "student_requests_verification_code_key" ON "student_requests"("verification_code");

-- CreateIndex
CREATE INDEX "student_requests_tenant_id_student_code_idx" ON "student_requests"("tenant_id", "student_code");

-- CreateIndex
CREATE INDEX "student_requests_tenant_id_status_idx" ON "student_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "student_requests_verification_code_idx" ON "student_requests"("verification_code");

-- AddForeignKey
ALTER TABLE "certificate_types" ADD CONSTRAINT "certificate_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_requests" ADD CONSTRAINT "student_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_requests" ADD CONSTRAINT "student_requests_certificate_type_id_fkey" FOREIGN KEY ("certificate_type_id") REFERENCES "certificate_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

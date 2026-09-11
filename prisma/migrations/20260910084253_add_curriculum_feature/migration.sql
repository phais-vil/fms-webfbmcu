-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATE');

-- CreateTable
CREATE TABLE "curriculums" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_th" VARCHAR(150) NOT NULL,
    "degree_en" VARCHAR(150) NOT NULL,
    "degree_abbr_th" VARCHAR(50) NOT NULL,
    "degree_abbr_en" VARCHAR(50) NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "total_credits" INTEGER NOT NULL DEFAULT 136,
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "philosophy_th" TEXT,
    "philosophy_en" TEXT,
    "career_opportunities_th" TEXT,
    "career_opportunities_en" TEXT,
    "tuition_fees" VARCHAR(255),
    "cover_image" VARCHAR(500),
    "curriculum_pdf_url" VARCHAR(500),
    "effective_year" INTEGER NOT NULL DEFAULT 2568,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_department_id_idx" ON "curriculums"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_degree_level_idx" ON "curriculums"("tenant_id", "degree_level");

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_display_order_idx" ON "curriculums"("tenant_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "curriculums_tenant_id_code_key" ON "curriculums"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "curriculums" ADD CONSTRAINT "curriculums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculums" ADD CONSTRAINT "curriculums_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

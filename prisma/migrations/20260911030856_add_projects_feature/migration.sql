-- CreateEnum
CREATE TYPE "StrategicPillar" AS ENUM ('DHAMMA_STUDY', 'RESEARCH_INNOVATION', 'ACADEMIC_SERVICES', 'CULTURE_PRESERVATION', 'ORGANIZATION_EXCELLENCE');

-- CreateEnum
CREATE TYPE "ProjectQuarter" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "ProjectPlanStatus" AS ENUM ('DRAFT', 'PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');

-- CreateTable
CREATE TABLE "annual_projects" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_code" VARCHAR(50) NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "pillar" "StrategicPillar" NOT NULL,
    "quarter" "ProjectQuarter" NOT NULL DEFAULT 'Q1',
    "department" VARCHAR(150),
    "responsible_person" VARCHAR(150) NOT NULL,
    "responsible_email" VARCHAR(255),
    "allocated_budget" DECIMAL(12,2) NOT NULL,
    "spent_budget" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "target_kpi" TEXT NOT NULL,
    "actual_result" TEXT,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "status" "ProjectPlanStatus" NOT NULL DEFAULT 'PROPOSED',
    "start_date" DATE,
    "end_date" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "annual_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progress_updates" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "progress_percent" INTEGER NOT NULL,
    "spent_amount" DECIMAL(12,2) NOT NULL,
    "report_note" TEXT NOT NULL,
    "reporter_name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "annual_projects_project_code_key" ON "annual_projects"("project_code");

-- CreateIndex
CREATE INDEX "annual_projects_tenant_id_fiscal_year_idx" ON "annual_projects"("tenant_id", "fiscal_year");

-- CreateIndex
CREATE INDEX "annual_projects_tenant_id_pillar_idx" ON "annual_projects"("tenant_id", "pillar");

-- CreateIndex
CREATE INDEX "annual_projects_project_code_idx" ON "annual_projects"("project_code");

-- CreateIndex
CREATE INDEX "project_progress_updates_project_id_idx" ON "project_progress_updates"("project_id");

-- AddForeignKey
ALTER TABLE "annual_projects" ADD CONSTRAINT "annual_projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_progress_updates" ADD CONSTRAINT "project_progress_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "annual_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

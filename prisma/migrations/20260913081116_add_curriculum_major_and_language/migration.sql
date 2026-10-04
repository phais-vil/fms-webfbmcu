-- AlterTable
ALTER TABLE "curriculums" ADD COLUMN     "major_en" VARCHAR(150),
ADD COLUMN     "major_th" VARCHAR(150),
ADD COLUMN     "program_language" VARCHAR(30) NOT NULL DEFAULT 'THAI';

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_program_language_idx" ON "curriculums"("tenant_id", "program_language");

-- CreateTable
CREATE TABLE "academic_departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "academic_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "department_id" UUID NOT NULL,
    "prefix_th" VARCHAR(50) NOT NULL,
    "prefix_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "academic_rank_th" VARCHAR(100),
    "academic_rank_en" VARCHAR(100),
    "admin_position_th" VARCHAR(150),
    "admin_position_en" VARCHAR(150),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "office_room" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "bio_th" TEXT,
    "bio_en" TEXT,
    "research_interests" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_executive" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_departments_tenant_id_idx" ON "academic_departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_departments_tenant_id_code_key" ON "academic_departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_department_id_idx" ON "staff_profiles"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_is_executive_idx" ON "staff_profiles"("tenant_id", "is_executive");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_display_order_idx" ON "staff_profiles"("tenant_id", "display_order");

-- AddForeignKey
ALTER TABLE "academic_departments" ADD CONSTRAINT "academic_departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

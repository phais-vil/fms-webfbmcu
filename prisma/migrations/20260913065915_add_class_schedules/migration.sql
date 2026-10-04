-- CreateTable
CREATE TABLE "class_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "curriculum_id" UUID,
    "department_id" UUID NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "year_level" INTEGER NOT NULL DEFAULT 1,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255),
    "target_group_th" VARCHAR(200),
    "target_group_en" VARCHAR(200),
    "room_location_th" VARCHAR(255),
    "room_location_en" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "remarks_th" TEXT,
    "remarks_en" TEXT,
    "file_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedule_items" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "slot_period" VARCHAR(50),
    "course_code" VARCHAR(50) NOT NULL,
    "course_name_th" VARCHAR(255) NOT NULL,
    "course_name_en" VARCHAR(255),
    "instructors_th" TEXT NOT NULL,
    "instructors_en" TEXT,
    "room_or_note" VARCHAR(200),
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "class_schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_schedules_tenant_id_department_id_idx" ON "class_schedules"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "class_schedules_tenant_id_curriculum_id_idx" ON "class_schedules"("tenant_id", "curriculum_id");

-- CreateIndex
CREATE INDEX "class_schedules_tenant_id_academic_year_semester_idx" ON "class_schedules"("tenant_id", "academic_year", "semester");

-- CreateIndex
CREATE INDEX "class_schedule_items_schedule_id_day_of_week_idx" ON "class_schedule_items"("schedule_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curriculums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule_items" ADD CONSTRAINT "class_schedule_items_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "class_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

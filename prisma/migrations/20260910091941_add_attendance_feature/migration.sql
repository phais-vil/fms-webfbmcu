-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('LECTURE', 'SEMINAR', 'MEDITATION', 'FACULTY_ACTIVITY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "attendance_courses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_code" VARCHAR(50) NOT NULL,
    "course_name_th" VARCHAR(200) NOT NULL,
    "course_name_en" VARCHAR(200) NOT NULL,
    "section" VARCHAR(20) NOT NULL DEFAULT '1',
    "semester" VARCHAR(20) NOT NULL DEFAULT '1/2569',
    "instructor_name" VARCHAR(150) NOT NULL,
    "room_number" VARCHAR(50),
    "total_sessions" INTEGER NOT NULL DEFAULT 16,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "session_number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "session_type" "SessionType" NOT NULL DEFAULT 'LECTURE',
    "session_date" DATE NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "qr_token" VARCHAR(100),
    "qr_expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "student_code" VARCHAR(50) NOT NULL,
    "student_name" VARCHAR(150) NOT NULL,
    "major_program" VARCHAR(150),
    "check_in_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_courses_tenant_id_course_code_section_semester_key" ON "attendance_courses"("tenant_id", "course_code", "section", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_qr_token_key" ON "attendance_sessions"("qr_token");

-- CreateIndex
CREATE INDEX "attendance_sessions_tenant_id_course_id_idx" ON "attendance_sessions"("tenant_id", "course_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_qr_token_idx" ON "attendance_sessions"("qr_token");

-- CreateIndex
CREATE INDEX "attendance_records_tenant_id_student_code_idx" ON "attendance_records"("tenant_id", "student_code");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_session_id_student_code_key" ON "attendance_records"("session_id", "student_code");

-- AddForeignKey
ALTER TABLE "attendance_courses" ADD CONSTRAINT "attendance_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "attendance_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

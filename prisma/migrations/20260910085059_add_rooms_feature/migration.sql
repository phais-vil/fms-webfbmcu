-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('MEETING', 'CLASSROOM', 'SEMINAR', 'MEDITATION', 'AUDITORIUM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(150) NOT NULL,
    "name_en" VARCHAR(150) NOT NULL,
    "building" VARCHAR(150) NOT NULL,
    "floor" VARCHAR(50),
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "room_type" "RoomType" NOT NULL DEFAULT 'MEETING',
    "facilities" TEXT,
    "cover_image" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_bookings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "user_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "booking_date" DATE NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "organizer_name" VARCHAR(150) NOT NULL,
    "organizer_email" VARCHAR(255) NOT NULL,
    "organizer_phone" VARCHAR(50) NOT NULL,
    "department" VARCHAR(150),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rooms_tenant_id_room_type_idx" ON "rooms"("tenant_id", "room_type");

-- CreateIndex
CREATE INDEX "rooms_tenant_id_is_active_idx" ON "rooms"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_tenant_id_code_key" ON "rooms"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "room_bookings_tenant_id_room_id_booking_date_idx" ON "room_bookings"("tenant_id", "room_id", "booking_date");

-- CreateIndex
CREATE INDEX "room_bookings_tenant_id_status_idx" ON "room_bookings"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { DoorOpen } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { listPublicRooms, listRoomBookings } from "@/features/rooms/server";
import { RoomsPortalClient } from "./_components/rooms-portal-client";

export default async function PublicRoomsPage() {
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const [rooms, bookings] = await Promise.all([
    listPublicRooms(tenantId),
    listRoomBookings(tenantId),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <DoorOpen className="h-4 w-4" />
          {isThai ? "ระบบบริหารจัดการพื้นที่และห้องประชุม" : "Facility & Space Reservations"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isThai ? "บริการจองห้องประชุมและห้องเรียน" : "Room & Facility Reservations"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {isThai
            ? "ระบบบริการจองห้องประชุม ห้องเรียนบรรยาย ห้องสัมมนา และห้องปฏิบัติธรรม คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย เพื่อรองรับการจัดกิจกรรม การเรียนการสอน และการประชุมสัมมนาวิชาการ"
            : "Online booking and reservation system for conference rooms, lecture theaters, and meditation spaces at Faculty of Buddhism, MCU."}
        </p>
      </div>

      <RoomsPortalClient rooms={rooms} bookings={bookings} />
    </div>
  );
}

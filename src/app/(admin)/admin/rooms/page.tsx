import { requirePermission, hasPermission } from "@/features/identity/server";
import { ROOMS_P, listAdminRooms, listRoomBookings } from "@/features/rooms/server";
import { RoomsAdminClient } from "./_components/rooms-admin-client";

export default async function AdminRoomsPage() {
  const ctx = await requirePermission(ROOMS_P.roomsRead);
  const [rooms, bookings] = await Promise.all([
    listAdminRooms(ctx.tenantId),
    listRoomBookings(ctx.tenantId),
  ]);

  return (
    <RoomsAdminClient
      initialRooms={rooms}
      initialBookings={bookings}
      canManage={hasPermission(ctx, ROOMS_P.roomsManage)}
    />
  );
}

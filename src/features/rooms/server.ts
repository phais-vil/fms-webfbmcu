import "server-only";

export {
  listAdminRooms,
  listPublicRooms,
  getRoomById,
  listRoomBookings,
  checkTimeConflict,
  type RoomDto,
  type RoomBookingDto,
} from "./_internal/services";

export { ROOMS_P, ROOMS_PERMISSIONS } from "./permissions";

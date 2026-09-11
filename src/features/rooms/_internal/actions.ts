"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { resolvePublicTenantId } from "@/features/news/server";
import { ROOMS_P } from "../permissions";
import {
  createRoomSchema,
  updateRoomSchema,
  createBookingSchema,
} from "./validations";
import {
  listAdminRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomActive,
  listRoomBookings,
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  type RoomDto,
  type RoomBookingDto,
} from "./services";

export async function getAdminRoomsAction(): Promise<ActionResult<RoomDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsRead);
    return listAdminRooms(ctx.tenantId);
  });
}

export async function getAdminBookingsAction(filter?: {
  roomId?: string;
  date?: string;
  status?: string;
  search?: string;
}): Promise<ActionResult<RoomBookingDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsRead);
    return listRoomBookings(ctx.tenantId, filter);
  });
}

export async function createRoomAction(input: unknown): Promise<ActionResult<RoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const parsed = createRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createRoom(ctx.tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function updateRoomAction(input: unknown): Promise<ActionResult<RoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const parsed = updateRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateRoom(ctx.tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function deleteRoomAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    await deleteRoom(ctx.tenantId, id);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
  });
}

export async function toggleRoomActiveAction(id: string): Promise<ActionResult<RoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const result = await toggleRoomActive(ctx.tenantId, id);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function submitBookingRequestAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const tenantId = await resolvePublicTenantId();
    const parsed = createBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createBooking(tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function approveBookingAction(bookingId: string): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const result = await approveBooking(ctx.tenantId, bookingId, ctx.userId);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function rejectBookingAction(
  bookingId: string,
  reason: string
): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const result = await rejectBooking(ctx.tenantId, bookingId, reason, ctx.userId);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    await cancelBooking(ctx.tenantId, bookingId);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
  });
}

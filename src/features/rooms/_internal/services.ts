import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, RoomType, BookingStatus } from "@/generated/prisma";
import type { CreateRoomInput, UpdateRoomInput, CreateBookingInput } from "./validations";

export interface RoomDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  building: string;
  floor: string | null;
  capacity: number;
  roomType: RoomType;
  facilities: string | null;
  coverImage: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomBookingDto {
  id: string;
  tenantId: string;
  roomId: string;
  roomNameTh: string;
  roomNameEn: string;
  roomCode: string;
  building: string;
  floor: string | null;
  userId: string | null;
  title: string;
  description: string | null;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  attendeesCount: number;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  department: string | null;
  status: BookingStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listAdminRooms(
  tenantId: string,
  filter?: { roomType?: string; search?: string }
): Promise<RoomDto[]> {
  const where: Prisma.RoomWhereInput = { tenantId };

  if (filter?.roomType && filter.roomType !== "ALL") {
    where.roomType = filter.roomType as RoomType;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { building: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const rooms = await prisma.room.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
  });

  return rooms.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    building: r.building,
    floor: r.floor,
    capacity: r.capacity,
    roomType: r.roomType,
    facilities: r.facilities,
    coverImage: r.coverImage,
    isActive: r.isActive,
    displayOrder: r.displayOrder,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function listPublicRooms(
  tenantId: string,
  filter?: { roomType?: string; search?: string }
): Promise<RoomDto[]> {
  const where: Prisma.RoomWhereInput = {
    tenantId,
    isActive: true,
  };

  if (filter?.roomType && filter.roomType !== "ALL") {
    where.roomType = filter.roomType as RoomType;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { building: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const rooms = await prisma.room.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
  });

  return rooms.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    building: r.building,
    floor: r.floor,
    capacity: r.capacity,
    roomType: r.roomType,
    facilities: r.facilities,
    coverImage: r.coverImage,
    isActive: r.isActive,
    displayOrder: r.displayOrder,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getRoomById(tenantId: string, id: string): Promise<RoomDto | null> {
  const r = await prisma.room.findFirst({
    where: { id, tenantId },
  });
  if (!r) return null;

  return {
    id: r.id,
    tenantId: r.tenantId,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    building: r.building,
    floor: r.floor,
    capacity: r.capacity,
    roomType: r.roomType,
    facilities: r.facilities,
    coverImage: r.coverImage,
    isActive: r.isActive,
    displayOrder: r.displayOrder,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function createRoom(tenantId: string, input: CreateRoomInput): Promise<RoomDto> {
  const created = await prisma.room.create({
    data: {
      tenantId,
      code: input.code.trim().toUpperCase(),
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      building: input.building.trim(),
      floor: input.floor || null,
      capacity: input.capacity,
      roomType: input.roomType as RoomType,
      facilities: input.facilities || null,
      coverImage: input.coverImage || null,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    building: created.building,
    floor: created.floor,
    capacity: created.capacity,
    roomType: created.roomType,
    facilities: created.facilities,
    coverImage: created.coverImage,
    isActive: created.isActive,
    displayOrder: created.displayOrder,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateRoom(tenantId: string, input: UpdateRoomInput): Promise<RoomDto> {
  await prisma.room.findFirstOrThrow({
    where: { id: input.id, tenantId },
  });

  const data: Prisma.RoomUncheckedUpdateInput = {};
  if (input.code !== undefined) data.code = input.code.trim().toUpperCase();
  if (input.nameTh !== undefined) data.nameTh = input.nameTh.trim();
  if (input.nameEn !== undefined) data.nameEn = input.nameEn.trim();
  if (input.building !== undefined) data.building = input.building.trim();
  if (input.floor !== undefined) data.floor = input.floor || null;
  if (input.capacity !== undefined) data.capacity = input.capacity;
  if (input.roomType !== undefined) data.roomType = input.roomType as RoomType;
  if (input.facilities !== undefined) data.facilities = input.facilities || null;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage || null;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;

  const updated = await prisma.room.update({
    where: { id: input.id },
    data,
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    building: updated.building,
    floor: updated.floor,
    capacity: updated.capacity,
    roomType: updated.roomType,
    facilities: updated.facilities,
    coverImage: updated.coverImage,
    isActive: updated.isActive,
    displayOrder: updated.displayOrder,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteRoom(tenantId: string, id: string): Promise<void> {
  await prisma.room.delete({
    where: { id, tenantId },
  });
}

export async function toggleRoomActive(tenantId: string, id: string): Promise<RoomDto> {
  const current = await prisma.room.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateRoom(tenantId, { id, isActive: !current.isActive });
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking Services & Conflict Detection
// ─────────────────────────────────────────────────────────────────────────────

export async function checkTimeConflict(
  tenantId: string,
  roomId: string,
  bookingDate: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  // A conflict happens if existing booking:
  // existing.startTime < newEndTime AND existing.endTime > newStartTime
  const conflicting = await prisma.roomBooking.findFirst({
    where: {
      tenantId,
      roomId,
      bookingDate,
      status: { in: ["PENDING", "APPROVED"] },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  return conflicting !== null;
}

export async function listRoomBookings(
  tenantId: string,
  filter?: { roomId?: string; date?: string; status?: string; search?: string }
): Promise<RoomBookingDto[]> {
  const where: Prisma.RoomBookingWhereInput = { tenantId };

  if (filter?.roomId && filter.roomId !== "ALL") {
    where.roomId = filter.roomId;
  }
  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as BookingStatus;
  }
  if (filter?.date) {
    where.bookingDate = new Date(filter.date);
  }
  if (filter?.search) {
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      { organizerName: { contains: filter.search, mode: "insensitive" } },
      { department: { contains: filter.search, mode: "insensitive" } },
      { room: { nameTh: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  const bookings = await prisma.roomBooking.findMany({
    where,
    include: { room: true },
    orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
  });

  return bookings.map((b) => ({
    id: b.id,
    tenantId: b.tenantId,
    roomId: b.roomId,
    roomNameTh: b.room.nameTh,
    roomNameEn: b.room.nameEn,
    roomCode: b.room.code,
    building: b.room.building,
    floor: b.room.floor,
    userId: b.userId,
    title: b.title,
    description: b.description,
    bookingDate: b.bookingDate.toISOString().split("T")[0],
    startTime: b.startTime,
    endTime: b.endTime,
    attendeesCount: b.attendeesCount,
    organizerName: b.organizerName,
    organizerEmail: b.organizerEmail,
    organizerPhone: b.organizerPhone,
    department: b.department,
    status: b.status,
    approvedById: b.approvedById,
    approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
    rejectionReason: b.rejectionReason,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));
}

export async function createBooking(
  tenantId: string,
  input: CreateBookingInput,
  userId?: string
): Promise<RoomBookingDto> {
  const bookingDate = new Date(input.bookingDate);

  const hasConflict = await checkTimeConflict(
    tenantId,
    input.roomId,
    bookingDate,
    input.startTime,
    input.endTime
  );

  if (hasConflict) {
    throw new Error("ห้องนี้ถูกจองหรือใช้งานในช่วงเวลาดังกล่าวแล้ว (Time Conflict)");
  }

  const created = await prisma.roomBooking.create({
    data: {
      tenantId,
      roomId: input.roomId,
      userId: userId || null,
      title: input.title.trim(),
      description: input.description || null,
      bookingDate,
      startTime: input.startTime,
      endTime: input.endTime,
      attendeesCount: input.attendeesCount,
      organizerName: input.organizerName.trim(),
      organizerEmail: input.organizerEmail.trim().toLowerCase(),
      organizerPhone: input.organizerPhone.trim(),
      department: input.department || null,
      status: "PENDING",
    },
    include: { room: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    roomId: created.roomId,
    roomNameTh: created.room.nameTh,
    roomNameEn: created.room.nameEn,
    roomCode: created.room.code,
    building: created.room.building,
    floor: created.room.floor,
    userId: created.userId,
    title: created.title,
    description: created.description,
    bookingDate: created.bookingDate.toISOString().split("T")[0],
    startTime: created.startTime,
    endTime: created.endTime,
    attendeesCount: created.attendeesCount,
    organizerName: created.organizerName,
    organizerEmail: created.organizerEmail,
    organizerPhone: created.organizerPhone,
    department: created.department,
    status: created.status,
    approvedById: created.approvedById,
    approvedAt: created.approvedAt ? created.approvedAt.toISOString() : null,
    rejectionReason: created.rejectionReason,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function approveBooking(
  tenantId: string,
  bookingId: string,
  approvedById: string
): Promise<RoomBookingDto> {
  const booking = await prisma.roomBooking.findFirstOrThrow({
    where: { id: bookingId, tenantId },
  });

  // Re-check conflict before approving
  const hasConflict = await checkTimeConflict(
    tenantId,
    booking.roomId,
    booking.bookingDate,
    booking.startTime,
    booking.endTime,
    booking.id
  );

  if (hasConflict) {
    throw new Error("ไม่สามารถอนุมัติได้เนื่องจากมีรายการอื่นได้รับการอนุมัติในช่วงเวลานี้ไปแล้ว");
  }

  const updated = await prisma.roomBooking.update({
    where: { id: bookingId },
    data: {
      status: "APPROVED",
      approvedById,
      approvedAt: new Date(),
    },
    include: { room: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    roomId: updated.roomId,
    roomNameTh: updated.room.nameTh,
    roomNameEn: updated.room.nameEn,
    roomCode: updated.room.code,
    building: updated.room.building,
    floor: updated.room.floor,
    userId: updated.userId,
    title: updated.title,
    description: updated.description,
    bookingDate: updated.bookingDate.toISOString().split("T")[0],
    startTime: updated.startTime,
    endTime: updated.endTime,
    attendeesCount: updated.attendeesCount,
    organizerName: updated.organizerName,
    organizerEmail: updated.organizerEmail,
    organizerPhone: updated.organizerPhone,
    department: updated.department,
    status: updated.status,
    approvedById: updated.approvedById,
    approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
    rejectionReason: updated.rejectionReason,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function rejectBooking(
  tenantId: string,
  bookingId: string,
  rejectionReason: string,
  approvedById: string
): Promise<RoomBookingDto> {
  await prisma.roomBooking.findFirstOrThrow({
    where: { id: bookingId, tenantId },
  });

  const updated = await prisma.roomBooking.update({
    where: { id: bookingId },
    data: {
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      approvedById,
      approvedAt: new Date(),
    },
    include: { room: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    roomId: updated.roomId,
    roomNameTh: updated.room.nameTh,
    roomNameEn: updated.room.nameEn,
    roomCode: updated.room.code,
    building: updated.room.building,
    floor: updated.room.floor,
    userId: updated.userId,
    title: updated.title,
    description: updated.description,
    bookingDate: updated.bookingDate.toISOString().split("T")[0],
    startTime: updated.startTime,
    endTime: updated.endTime,
    attendeesCount: updated.attendeesCount,
    organizerName: updated.organizerName,
    organizerEmail: updated.organizerEmail,
    organizerPhone: updated.organizerPhone,
    department: updated.department,
    status: updated.status,
    approvedById: updated.approvedById,
    approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
    rejectionReason: updated.rejectionReason,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function cancelBooking(tenantId: string, bookingId: string): Promise<void> {
  await prisma.roomBooking.update({
    where: { id: bookingId, tenantId },
    data: { status: "CANCELLED" },
  });
}

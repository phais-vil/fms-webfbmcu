import { z } from "zod";

export const RoomTypeEnum = z.enum(["MEETING", "CLASSROOM", "SEMINAR", "MEDITATION", "AUDITORIUM"]);
export const BookingStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]);

export const createRoomSchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสห้อง").max(50),
  nameTh: z.string().min(2, "กรุณากรอกชื่อห้องภาษาไทย").max(150),
  nameEn: z.string().min(2, "Please enter English room name").max(150),
  building: z.string().min(1, "กรุณาระบุอาคารสถานที่").max(150),
  floor: z.string().max(50).optional().nullable(),
  capacity: z.coerce.number().int().min(1, "ความจุต้องมากกว่า 0").default(20),
  roomType: RoomTypeEnum.default("MEETING"),
  facilities: z.string().optional().nullable(),
  coverImage: z.string().url("URL ไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateRoomSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50).optional(),
  nameTh: z.string().min(2).max(150).optional(),
  nameEn: z.string().min(2).max(150).optional(),
  building: z.string().min(1).max(150).optional(),
  floor: z.string().max(50).optional().nullable(),
  capacity: z.coerce.number().int().min(1).optional(),
  roomType: RoomTypeEnum.optional(),
  facilities: z.string().optional().nullable(),
  coverImage: z.string().url().or(z.literal("")).optional().nullable(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export const createBookingSchema = z
  .object({
    roomId: z.string().uuid("กรุณาเลือกห้องที่ต้องการจอง"),
    title: z.string().min(2, "กรุณากรอกหัวข้อการประชุมหรือกิจกรรม").max(255),
    description: z.string().optional().nullable(),
    bookingDate: z.string().min(10, "กรุณาเลือกวันที่ใช้งาน (YYYY-MM-DD)"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาไม่ถูกต้อง (เช่น 09:00)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาไม่ถูกต้อง (เช่น 12:00)"),
    attendeesCount: z.coerce.number().int().min(1, "จำนวนผู้เข้าร่วมต้องมากกว่า 0").default(1),
    organizerName: z.string().min(2, "กรุณากรอกชื่อผู้จอง/ผู้ประสานงาน").max(150),
    organizerEmail: z.string().email("อีเมลไม่ถูกต้อง"),
    organizerPhone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ติดต่อ").max(50),
    department: z.string().max(150).optional().nullable(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด",
    path: ["endTime"],
  });

export const reviewBookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
  rejectionReason: z.string().optional().nullable(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ReviewBookingInput = z.infer<typeof reviewBookingSchema>;
export type RoomType = z.infer<typeof RoomTypeEnum>;
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

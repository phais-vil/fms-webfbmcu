import { z } from "zod";

export const SessionTypeEnum = z.enum([
  "LECTURE",
  "SEMINAR",
  "MEDITATION",
  "FACULTY_ACTIVITY",
]);

export const AttendanceStatusEnum = z.enum([
  "PRESENT",
  "LATE",
  "ABSENT",
  "EXCUSED",
]);

export const SessionStatusEnum = z.enum([
  "SCHEDULED",
  "OPEN",
  "CLOSED",
]);

export const createCourseSchema = z.object({
  courseCode: z.string().min(2, "กรุณากรอกรหัสวิชา").max(50),
  courseNameTh: z.string().min(2, "กรุณากรอกชื่อวิชาภาษาไทย").max(200),
  courseNameEn: z.string().min(2, "กรุณากรอกชื่อวิชาภาษาอังกฤษ").max(200),
  section: z.string().min(1).default("1"),
  semester: z.string().min(1).default("1/2569"),
  instructorName: z.string().min(2, "กรุณาระบุชื่ออาจารย์ผู้สอน").max(150),
  roomNumber: z.string().max(50).optional().nullable(),
  totalSessions: z.coerce.number().int().min(1).max(40).default(16),
  isActive: z.boolean().default(true),
});

export const updateCourseSchema = z.object({
  id: z.string().uuid(),
  courseCode: z.string().min(2).max(50).optional(),
  courseNameTh: z.string().min(2).max(200).optional(),
  courseNameEn: z.string().min(2).max(200).optional(),
  section: z.string().min(1).optional(),
  semester: z.string().min(1).optional(),
  instructorName: z.string().min(2).max(150).optional(),
  roomNumber: z.string().max(50).optional().nullable(),
  totalSessions: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const createSessionSchema = z.object({
  courseId: z.string().uuid("กรุณาเลือกรายวิชา"),
  sessionNumber: z.coerce.number().int().min(1, "ครั้งที่ต้องมากกว่า 0"),
  title: z.string().min(2, "กรุณาระบุหัวข้อการเรียนหรือกิจกรรม").max(200),
  sessionType: SessionTypeEnum.default("LECTURE"),
  sessionDate: z.string().min(10, "กรุณาเลือกวันที่"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาไม่ถูกต้อง (HH:mm)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาไม่ถูกต้อง (HH:mm)"),
});

export const openSessionSchema = z.object({
  sessionId: z.string().uuid(),
  expirySeconds: z.coerce.number().int().min(15).max(3600).default(60),
});

export const studentCheckInSchema = z.object({
  qrToken: z.string().min(6, "รหัส QR Token ไม่ถูกต้อง").max(100),
  studentCode: z.string().min(5, "กรุณากรอกรหัสนิสิต").max(50),
  studentName: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล").max(150),
  majorProgram: z.string().max(150).optional().nullable(),
});

export const updateRecordStatusSchema = z.object({
  recordId: z.string().uuid(),
  status: AttendanceStatusEnum,
  remarks: z.string().optional().nullable(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type OpenSessionInput = z.infer<typeof openSessionSchema>;
export type StudentCheckInInput = z.infer<typeof studentCheckInSchema>;
export type UpdateRecordStatusInput = z.infer<typeof updateRecordStatusSchema>;

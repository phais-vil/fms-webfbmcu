import { z } from "zod";

export const CertificateCategoryEnum = z.enum([
  "ENROLLMENT",
  "CONDUCT",
  "BANK_ACCOUNT",
  "MILITARY_DEFERMENT",
  "VOLUNTEER",
  "TRANSCRIPT_REQUEST",
]);

export const RequestStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const DegreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL"]);

export const createCertificateTypeSchema = z.object({
  code: z.string().min(1, "กรุณาระบุรหัสประเภทเอกสาร").max(50),
  nameTh: z.string().min(2, "กรุณาระบุชื่อประเภทเอกสารภาษาไทย").max(150),
  nameEn: z.string().min(2, "Please enter English certificate type name").max(150),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  category: CertificateCategoryEnum.default("ENROLLMENT"),
  processingDays: z.coerce.number().int().min(1, "ระยะเวลาต้องมากกว่า 0 วัน").default(3),
  fee: z.coerce.number().min(0, "ค่าธรรมเนียมต้องไม่ติดลบ").default(0),
  requiresDoc: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateCertificateTypeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50).optional(),
  nameTh: z.string().min(2).max(150).optional(),
  nameEn: z.string().min(2).max(150).optional(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  category: CertificateCategoryEnum.optional(),
  processingDays: z.coerce.number().int().min(1).optional(),
  fee: z.coerce.number().min(0).optional(),
  requiresDoc: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export const submitStudentRequestSchema = z.object({
  certificateTypeId: z.string().uuid("กรุณาเลือกประเภทเอกสารที่ต้องการขอ"),
  studentCode: z.string().min(5, "กรุณากรอกรหัสนิสิต").max(50),
  titleTh: z.string().max(50).optional().nullable(),
  firstNameTh: z.string().min(2, "กรุณากรอกชื่อภาษาไทย").max(100),
  lastNameTh: z.string().min(2, "กรุณากรอกนามสกุลภาษาไทย").max(100),
  firstNameEn: z.string().max(100).optional().nullable(),
  lastNameEn: z.string().max(100).optional().nullable(),
  degreeLevel: DegreeLevelEnum.default("BACHELOR"),
  majorProgram: z.string().min(2, "กรุณาระบุสาขาวิชา/หลักสูตร").max(150),
  yearLevel: z.coerce.number().int().min(1, "ชั้นปีต้องอยู่ระหว่าง 1-8").max(8).default(1),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ติดต่อ").max(50),
  purpose: z.string().min(3, "กรุณาระบุวัตถุประสงค์ในการขอเอกสาร"),
  copies: z.coerce.number().int().min(1, "จำนวนฉบับต้องมากกว่า 0").max(10, "ขอได้ไม่เกิน 10 ฉบับต่อครั้ง").default(1),
});

export const reviewStudentRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "PROCESSING", "CANCELLED"]),
  approverNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

export type CreateCertificateTypeInput = z.infer<typeof createCertificateTypeSchema>;
export type UpdateCertificateTypeInput = z.infer<typeof updateCertificateTypeSchema>;
export type SubmitStudentRequestInput = z.infer<typeof submitStudentRequestSchema>;
export type ReviewStudentRequestInput = z.infer<typeof reviewStudentRequestSchema>;
